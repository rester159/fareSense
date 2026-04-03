# FareSense ML Pipeline

Train an XGBoost model on historical airfare data to predict whether current fares are a good deal.

## Setup

```bash
cd ml
pip install -r requirements.txt
```

## Pipeline

### 1. Download training data
```bash
python download_data.py
```
Downloads BTS DB1B data (US domestic fares, public domain) and optionally Kaggle flight prices.

### 2. Train the model
```bash
python train_model.py
```
Trains XGBoost classifier on engineered features: route distance, fare position vs historical median, seasonality, carrier competition, and price volatility.

### 3. Export for production
```bash
python export_model.py
```
Exports the model as `src/lib/model-weights.json` for TypeScript inference in the Next.js app.

## Data Sources

| Source | Records | Coverage | License |
|--------|---------|----------|---------|
| BTS DB1B | ~10M/quarter | US domestic | Public domain |
| Kaggle (dilwong) | ~31M | US domestic (Expedia) | Kaggle license |
| FareSense search logs | Growing | User-searched routes | Own data |
