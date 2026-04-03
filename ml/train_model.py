"""
Train XGBoost fare prediction model for FareSense.

Uses BTS DB1B data to learn relationships between route characteristics
and fare pricing. Outputs a model that predicts whether current fares
are above or below historical norms for a given route.

Usage:
  python download_data.py   # first, get the data
  python train_model.py     # train the model
  python export_model.py    # export for JS inference
"""

import os
import glob
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_absolute_error
import xgboost as xgb

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")


def load_bts_data() -> pd.DataFrame:
    """Load and combine BTS DB1B Market CSV files."""
    bts_dir = os.path.join(DATA_DIR, "bts")
    csv_files = glob.glob(os.path.join(bts_dir, "**", "*.csv"), recursive=True)

    if not csv_files:
        raise FileNotFoundError(
            f"No CSV files found in {bts_dir}. Run download_data.py first."
        )

    print(f"Loading {len(csv_files)} BTS CSV files...")
    frames = []
    for f in csv_files:
        try:
            df = pd.read_csv(f, low_memory=False)
            frames.append(df)
            print(f"  Loaded {f}: {len(df):,} rows")
        except Exception as e:
            print(f"  Skipped {f}: {e}")

    combined = pd.concat(frames, ignore_index=True)
    print(f"Total rows: {len(combined):,}")
    return combined


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Create ML features from raw BTS data."""
    # BTS DB1B Market columns of interest:
    # YEAR, QUARTER, ORIGIN, DEST, MARKET_FARE, MARKET_DISTANCE,
    # PASSENGERS, OPERATING_CARRIER, FARE_CLASS

    required = ["YEAR", "QUARTER", "ORIGIN", "DEST", "MARKET_FARE", "MARKET_DISTANCE"]
    available = [c for c in required if c in df.columns]

    if len(available) < len(required):
        # Try alternate column names (BTS sometimes varies)
        col_map = {
            "MktFare": "MARKET_FARE",
            "MktDistance": "MARKET_DISTANCE",
            "Origin": "ORIGIN",
            "Dest": "DEST",
            "Year": "YEAR",
            "Quarter": "QUARTER",
        }
        df = df.rename(columns={k: v for k, v in col_map.items() if k in df.columns})

    # Filter valid rows
    df = df.dropna(subset=["MARKET_FARE", "MARKET_DISTANCE", "ORIGIN", "DEST"])
    df = df[df["MARKET_FARE"] > 0]
    df = df[df["MARKET_DISTANCE"] > 0]

    # Route-level aggregations
    route_stats = df.groupby(["ORIGIN", "DEST"]).agg(
        route_avg_fare=("MARKET_FARE", "mean"),
        route_median_fare=("MARKET_FARE", "median"),
        route_std_fare=("MARKET_FARE", "std"),
        route_q25_fare=("MARKET_FARE", lambda x: x.quantile(0.25)),
        route_q75_fare=("MARKET_FARE", lambda x: x.quantile(0.75)),
        route_num_records=("MARKET_FARE", "count"),
    ).reset_index()

    # Merge route stats back
    df = df.merge(route_stats, on=["ORIGIN", "DEST"], how="left")

    # Feature: is fare below route median?
    df["fare_below_median"] = (df["MARKET_FARE"] < df["route_median_fare"]).astype(int)

    # Feature: fare percentile position
    df["fare_pct_of_median"] = df["MARKET_FARE"] / df["route_median_fare"]

    # Feature: quarter (seasonality proxy)
    df["quarter"] = df.get("QUARTER", 1)

    # Feature: distance bucket
    df["distance_bucket"] = pd.cut(
        df["MARKET_DISTANCE"],
        bins=[0, 500, 1000, 2000, 5000, 20000],
        labels=[0, 1, 2, 3, 4],
    ).astype(float)

    # Feature: route competition (num carriers per route)
    if "OPERATING_CARRIER" in df.columns or "OP_CARRIER_AIRLINE_ID" in df.columns:
        carrier_col = "OPERATING_CARRIER" if "OPERATING_CARRIER" in df.columns else "OP_CARRIER_AIRLINE_ID"
        carrier_counts = df.groupby(["ORIGIN", "DEST"])[carrier_col].nunique().reset_index()
        carrier_counts.columns = ["ORIGIN", "DEST", "num_carriers"]
        df = df.merge(carrier_counts, on=["ORIGIN", "DEST"], how="left")
    else:
        df["num_carriers"] = 1

    # Feature: fare volatility (std / mean for route)
    df["fare_volatility"] = df["route_std_fare"] / df["route_avg_fare"]
    df["fare_volatility"] = df["fare_volatility"].fillna(0)

    return df


def train_price_model(df: pd.DataFrame):
    """Train XGBoost model to predict if a fare is a good deal."""
    feature_cols = [
        "MARKET_DISTANCE",
        "fare_pct_of_median",
        "quarter",
        "distance_bucket",
        "num_carriers",
        "fare_volatility",
        "route_num_records",
    ]

    # Ensure all feature columns exist
    for col in feature_cols:
        if col not in df.columns:
            print(f"Warning: missing column {col}, filling with 0")
            df[col] = 0

    target = "fare_below_median"

    X = df[feature_cols].fillna(0)
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"\nTraining set: {len(X_train):,} rows")
    print(f"Test set: {len(X_test):,} rows")
    print(f"Positive rate (below median): {y_train.mean():.2%}")

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
    )

    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=20,
    )

    # Evaluate
    y_pred = model.predict(X_test)
    print("\n=== Classification Report ===")
    print(classification_report(y_test, y_pred, target_names=["Above Median", "Below Median"]))

    # Feature importance
    importance = dict(zip(feature_cols, model.feature_importances_))
    print("\n=== Feature Importance ===")
    for feat, imp in sorted(importance.items(), key=lambda x: -x[1]):
        print(f"  {feat}: {imp:.4f}")

    return model, feature_cols


def save_model(model, feature_cols: list):
    """Save model and metadata."""
    os.makedirs(MODEL_DIR, exist_ok=True)

    model_path = os.path.join(MODEL_DIR, "fare_model.json")
    model.save_model(model_path)
    print(f"\nModel saved to: {model_path}")

    meta = {
        "features": feature_cols,
        "model_type": "xgboost_classifier",
        "target": "fare_below_median",
        "description": "Predicts whether a fare is below the historical route median",
    }
    meta_path = os.path.join(MODEL_DIR, "model_meta.json")
    with open(meta_path, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Metadata saved to: {meta_path}")


if __name__ == "__main__":
    print("FareSense ML Training Pipeline")
    print("=" * 40)

    df = load_bts_data()
    df = engineer_features(df)

    print(f"\nEngineered features: {len(df):,} rows")
    print(f"Columns: {list(df.columns)}")

    model, feature_cols = train_price_model(df)
    save_model(model, feature_cols)

    print("\n✓ Training complete.")
    print("Next step: python export_model.py")
