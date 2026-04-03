# FareSense — Product Requirements Document

**Version:** 1.0
**Date:** April 2026
**Author:** Enrico D'Angelo

---

## 1. Product Vision

FareSense is a flight fare prediction tool that helps travelers decide the optimal time to purchase airline tickets. By analyzing pricing trends, seasonality, route competition, and historical fare data, it provides actionable buy/wait recommendations with confidence scores.

### Target Audience
- Budget-conscious travelers planning domestic US flights
- Frequent flyers optimizing ticket purchase timing
- Travel enthusiasts who enjoy finding deals

### Value Proposition
- **Free to use** — no subscription, no account required
- **Transparent predictions** — shows the signals driving each recommendation
- **30-day price forecast** — visual chart of expected price movement
- **Booking integration** — direct links to book via Kiwi.com affiliate

### Revenue Model
- Kiwi.com affiliate commissions on bookings
- Future: premium tier with fare alerts and multi-route tracking

---

## 2. Architecture

### Tech Stack
| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 | Server-rendered web app |
| Charts | Recharts | 30-day price forecast visualization |
| Flight Data | Kiwi.com Tequila API | Real-time flight search (affiliate model) |
| Database | Neon Postgres (serverless) | Search logging for ML training data |
| Prediction | Heuristic engine (XGBoost ML planned) | Buy/wait recommendations |
| Hosting | Railway | Auto-deploy from GitHub main branch |
| Analytics | Plausible | Privacy-friendly pageview tracking |
| Email | Resend (planned) | Fare alert notifications |

### System Flow
```
User enters route + dates
  → /api/search calls Kiwi Tequila API
  → Maps response to internal FlightOffer type
  → Derives price quartiles from offer spread
  → Logs search + offers to Neon (fire-and-forget)
  → Returns offers + priceAnalysis to frontend

Frontend receives results
  → Identifies best price
  → POST /api/predict with price data
  → Prediction engine analyzes 6 signals
  → Returns action (BUY/WAIT), confidence, forecast
  → Renders PredictionHero, ForecastChart, FareList
```

---

## 3. Feature Inventory

### Shipped (MVP Phase 1)
- [x] Flight search via Kiwi Tequila API
- [x] Results page with fare cards sorted by price
- [x] Buy/Wait prediction with confidence meter
- [x] 30-day price forecast chart
- [x] 6-signal prediction engine (heuristic)
- [x] Search logging to Neon for ML data collection
- [x] "Book on Kiwi" affiliate links
- [x] Dark theme UI with animations
- [x] Mobile-responsive design
- [x] SEO foundation (OG tags, sitemap, robots.txt, JSON-LD)
- [x] Plausible analytics integration
- [x] Security headers
- [x] Railway deployment with auto-deploy

### In Progress
- [ ] Kiwi API key approval (pending affiliate email)
- [ ] ML training pipeline (scaffolded, awaiting data download + training)

### Planned (Phase 2)
- [ ] XGBoost ML model replacing heuristic predictions
- [ ] Fare alert emails via Resend (watch a route, get notified on price drops)
- [ ] User accounts (optional, for saved searches)
- [ ] Multi-city / flexible date search
- [ ] Price history charts per route (from logged data)
- [ ] Blog / SEO content pages ("cheapest time to fly LAX to JFK")

### Planned (Phase 3)
- [ ] International route support
- [ ] Calendar view (cheapest dates to fly)
- [ ] Browser push notifications for price drops
- [ ] Mobile app (React Native or PWA)
- [ ] Premium tier (unlimited alerts, priority predictions)

---

## 4. Data Pipeline

### Live Data (Kiwi Tequila API)
- Real-time flight offers for user searches
- 150+ airlines, includes virtual interlining
- Returns: prices, airlines, segments, durations, booking tokens
- Limitation: no historical price data endpoint

### Search Logging (Neon Postgres)
Every search is logged to build a historical dataset:

**search_logs table:**
- Route (origin, destination, depart_date)
- Price summary (min, median, max, Q1, Q3)
- Carrier list, timestamp

**offer_logs table:**
- Individual offer details (price, carrier, stops, duration)
- Linked to parent search_log

### ML Training Data (Offline)
- **BTS DB1B** — US Bureau of Transportation Statistics
  - Quarterly, ~10M records/quarter, decades of history
  - Public domain, free download
  - Contains: origin, destination, fare paid, distance, carrier
- **Kaggle dilwong/flightprices** — 31M Expedia records
  - US domestic, April-October 2022
  - Good for feature engineering prototyping

### ML Pipeline
```
ml/download_data.py  → Fetches BTS + Kaggle CSVs
ml/train_model.py    → Engineers features, trains XGBoost
ml/export_model.py   → Exports model to JSON for TypeScript
src/lib/model-weights.json → Loaded by prediction engine at runtime
```

**Model features:**
- Route distance
- Fare position vs route historical median
- Quarter (seasonality)
- Number of carriers on route (competition)
- Fare volatility (std/mean for route)
- Direct vs connecting flight

---

## 5. Prediction Engine

### Current: Heuristic (6 Signals)
| Signal | What It Measures | Weight Range |
|--------|-----------------|--------------|
| Advance Purchase | Days until departure | -0.9 to +0.5 |
| Departure Day | Day-of-week pricing patterns | -0.3 to +0.3 |
| Historical Position | Current price vs Q1/Q2/Q3 quartiles | -0.8 to +0.7 |
| Carrier Competition | Number of airlines on route | -0.3 to +0.3 |
| Price Spread | Volatility across current offers | -0.2 to +0.3 |
| Seasonality | Monthly demand patterns | -0.5 to +0.4 |

**Output:** Weighted score → BUY (negative) or WAIT (positive), confidence 50-95%, predicted savings, days to expected drop, 30-day forecast curve.

### Future: XGBoost ML Model
- Trained on BTS DB1B + live search logs
- Same output interface (PredictionResult type)
- Model weights loaded from JSON at runtime
- No Python required in production — pure TypeScript inference

---

## 6. SEO & Growth Foundation

### Technical SEO (Implemented)
- Open Graph meta tags (title, description, image)
- Twitter Card large image support
- JSON-LD structured data (WebSite schema with SearchAction)
- Canonical URLs
- sitemap.xml (auto-generated)
- robots.txt (allows crawlers, blocks /api/)
- Security headers (X-Frame-Options, CSP, Referrer-Policy)

### Analytics (Implemented)
- Plausible — privacy-friendly, GDPR-compliant, no cookie banner
- Configured via NEXT_PUBLIC_PLAUSIBLE_DOMAIN env var

### Content Strategy (Planned)
- SEO landing pages: "Cheapest time to fly [route]"
- Blog posts: seasonal travel guides, fare trend analysis
- Target long-tail keywords: "when to buy flights to [destination]"

### Distribution Channels (Planned)
- Reddit (r/travel, r/flights, r/shoestring) — organic launch posts
- Product Hunt launch
- Travel forums and communities
- Social media (Twitter/X, travel influencer outreach)

---

## 7. Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KIWI_API_KEY` | Yes | Kiwi Tequila API key |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | Yes | Public URL for canonical/OG tags |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | No | Plausible analytics domain |
| `RESEND_API_KEY` | No | Resend email service (Phase 2) |
| `ANTHROPIC_API_KEY` | No | Reserved for future AI analysis |
| `CRON_SECRET` | No | Auth for scheduled tasks |

---

## 8. Deployment

- **Platform:** Railway (auto-deploy from `main` branch)
- **URL:** faresense-production.up.railway.app
- **Port:** 8080 (Railway default, Next.js reads from PORT env var)
- **Build:** `pnpm install && pnpm build` (Railpack/Nixpacks auto-detected)
- **Start:** `pnpm start`
- **Database:** Neon Postgres (us-east-1, project: red-moon-67646950)

---

## 9. Repository Structure

```
faresense/
  src/
    app/
      api/search/      — Kiwi flight search + price logging
      api/predict/     — Buy/wait prediction endpoint
      results/         — Search results page
      layout.tsx       — Root layout with SEO + analytics
      page.tsx         — Homepage
      sitemap.ts       — Dynamic sitemap generation
      robots.ts        — Crawler rules
    components/        — UI (FareCard, ForecastChart, SearchForm, etc.)
    hooks/             — React hooks (useSearch, usePrediction)
    lib/
      kiwi.ts          — Kiwi Tequila API client
      prediction.ts    — Prediction engine
      search-logger.ts — Neon search logging
      db.ts            — Database client
      formatters.ts    — Price/date/duration formatting
      airports.ts      — Airport code lookup
      constants.ts     — App constants and carrier names
    types/             — TypeScript definitions
  database/            — SQL migrations
  ml/                  — Python ML training pipeline
  docs/                — Documentation (this file)
  public/              — Static assets
```
