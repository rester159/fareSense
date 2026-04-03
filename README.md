# FareSense

Flight fare prediction app that helps travelers decide the best time to buy tickets. Analyzes fare trends, seasonality, and pricing patterns to give buy/wait recommendations.

## Architecture

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS 4 + Recharts
- **Flight Data**: Kiwi.com Tequila API (affiliate model)
- **Database**: Neon Postgres (search logging for ML training data)
- **Prediction**: Heuristic engine (being replaced with XGBoost ML model)
- **Hosting**: Railway

## Getting Started

```bash
pnpm install
cp .env.example .env  # fill in KIWI_API_KEY and DATABASE_URL
pnpm dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KIWI_API_KEY` | Yes | Kiwi Tequila API key (register at tequila.kiwi.com) |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | No | Public URL (defaults to localhost:3000) |
| `CRON_SECRET` | No | Secret for scheduled tasks |

## Project Structure

```
src/
  app/
    api/search/     — Flight search endpoint (Kiwi API + price logging)
    api/predict/    — Buy/wait prediction endpoint
    results/        — Search results page
  components/       — UI components (FareCard, ForecastChart, etc.)
  hooks/            — React hooks (useSearch, usePrediction)
  lib/
    kiwi.ts         — Kiwi Tequila API client
    prediction.ts   — Prediction engine (heuristic, ML coming)
    search-logger.ts — Logs searches to Neon for ML training
    db.ts           — Neon database client
  types/            — TypeScript type definitions
database/           — SQL migrations
ml/                 — ML training pipeline (XGBoost)
```

## ML Pipeline

The `ml/` directory contains a Python pipeline to train fare prediction models on BTS DB1B historical airfare data. See `ml/README.md` for setup.

## Deployment

Deployed on Railway with auto-deploy from `main`. The app listens on the `PORT` env var (default 8080 on Railway).
