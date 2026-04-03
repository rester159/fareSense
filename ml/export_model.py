"""
Export trained XGBoost model to JSON format for TypeScript inference.

Converts the XGBoost tree ensemble into a simplified JSON structure
that can be loaded and evaluated in the Next.js prediction engine.

Usage:
  python train_model.py    # first, train the model
  python export_model.py   # export to JS-compatible JSON
"""

import os
import json
import numpy as np
import xgboost as xgb

MODEL_DIR = os.path.join(os.path.dirname(__file__), "model")
OUTPUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "src", "lib", "model-weights.json"
)


def export_tree_to_dict(tree_dump: str) -> list:
    """Parse XGBoost text dump into a list of node dicts."""
    nodes = []
    for line in tree_dump.strip().split("\n"):
        line = line.strip()
        if not line:
            continue

        # Extract node ID from indentation
        depth = (len(line) - len(line.lstrip())) // 4
        line = line.strip()

        if "leaf=" in line:
            node_id = int(line.split(":")[0])
            leaf_val = float(line.split("leaf=")[1].split(",")[0])
            nodes.append({"id": node_id, "leaf": leaf_val})
        elif "[" in line:
            node_id = int(line.split(":")[0])
            condition = line.split("[")[1].split("]")[0]
            feat, threshold = condition.split("<")
            yes = int(line.split("yes=")[1].split(",")[0])
            no = int(line.split("no=")[1].split(",")[0])
            nodes.append({
                "id": node_id,
                "feature": feat,
                "threshold": float(threshold),
                "yes": yes,
                "no": no,
            })

    return nodes


def export_model():
    """Export XGBoost model to JSON for TypeScript."""
    model_path = os.path.join(MODEL_DIR, "fare_model.json")
    meta_path = os.path.join(MODEL_DIR, "model_meta.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(
            f"No model found at {model_path}. Run train_model.py first."
        )

    model = xgb.XGBClassifier()
    model.load_model(model_path)

    with open(meta_path) as f:
        meta = json.load(f)

    # Get tree dump as text
    tree_dumps = model.get_booster().get_dump()
    print(f"Model has {len(tree_dumps)} trees")

    # Convert trees to JSON-friendly format
    trees = []
    for i, dump in enumerate(tree_dumps):
        nodes = export_tree_to_dict(dump)
        trees.append(nodes)

    # Also export feature importance for fallback/display
    importance = dict(zip(
        meta["features"],
        [float(x) for x in model.feature_importances_]
    ))

    export_data = {
        "model_type": "xgboost_classifier",
        "target": meta["target"],
        "features": meta["features"],
        "feature_importance": importance,
        "num_trees": len(trees),
        "trees": trees,
        "base_score": float(model.get_params().get("base_score", 0.5)),
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(export_data, f)

    size_kb = os.path.getsize(OUTPUT_PATH) / 1024
    print(f"\nExported model to: {OUTPUT_PATH}")
    print(f"File size: {size_kb:.1f} KB")
    print(f"Trees: {len(trees)}, Features: {len(meta['features'])}")
    print(f"\nReady for TypeScript inference in src/lib/prediction.ts")


if __name__ == "__main__":
    print("FareSense Model Export")
    print("=" * 40)
    export_model()
