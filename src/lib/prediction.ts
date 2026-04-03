import type { PriceAnalysisData, FlightOffer } from '@/types/flight';
import type {
  PredictionInput,
  PredictionResult,
  PredictionSignal,
  ForecastPoint,
} from '@/types/prediction';

// === SIGNAL FUNCTIONS ===

function analyzeAdvancePurchase(daysOut: number): PredictionSignal {
  let direction: 'buy' | 'wait' | 'neutral';
  let weight: number;
  let detail: string;

  if (daysOut <= 7) {
    direction = 'buy';
    weight = -0.9;
    detail = 'Less than 7 days out — fares almost always rise from here. Buy now.';
  } else if (daysOut <= 14) {
    direction = 'buy';
    weight = -0.6;
    detail = 'Under 2 weeks out — entering the danger zone. Prices trending up.';
  } else if (daysOut <= 21) {
    direction = 'neutral';
    weight = -0.2;
    detail = 'About 3 weeks out — approaching the sweet spot but limited upside.';
  } else if (daysOut <= 60) {
    direction = 'wait';
    weight = 0.3;
    detail = 'In the optimal 21-60 day domestic booking window. May see small drops.';
  } else if (daysOut <= 90) {
    direction = 'wait';
    weight = 0.5;
    detail = '2-3 months out — good chance of price adjustments downward.';
  } else {
    direction = 'wait';
    weight = 0.4;
    detail = 'Well in advance — airlines often reprice downward as departure approaches.';
  }

  return { name: 'Advance Purchase', direction, weight, detail };
}

function analyzeDayOfWeek(departDate: string): PredictionSignal {
  const day = new Date(departDate + 'T00:00:00').getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const dayScores: Record<number, number> = {
    0: -0.3, 1: 0.1, 2: 0.3, 3: 0.3, 4: 0.1, 5: -0.3, 6: -0.1,
  };

  const score = dayScores[day] || 0;
  return {
    name: 'Departure Day',
    direction: score > 0 ? 'wait' : score < 0 ? 'buy' : 'neutral',
    weight: score,
    detail: `Departing ${dayNames[day]} — ${score > 0 ? 'typically a cheaper travel day' : score < 0 ? 'typically a more expensive travel day' : 'average pricing day'}.`,
  };
}

function analyzePricePosition(
  currentPrice: number,
  priceAnalysis: PriceAnalysisData | null
): PredictionSignal {
  if (!priceAnalysis) {
    return {
      name: 'Historical Position',
      direction: 'neutral',
      weight: 0,
      detail: 'No historical data available for this route.',
    };
  }

  const { first, median, third } = priceAnalysis;

  if (currentPrice <= first) {
    return {
      name: 'Historical Position',
      direction: 'buy',
      weight: -0.8,
      detail: `At $${currentPrice}, this is below the 25th percentile ($${first}). This is a rare deal — buy before it disappears.`,
    };
  } else if (currentPrice <= median) {
    return {
      name: 'Historical Position',
      direction: 'buy',
      weight: -0.3,
      detail: `At $${currentPrice}, this is below the historical median ($${median}). Decent price.`,
    };
  } else if (currentPrice <= third) {
    return {
      name: 'Historical Position',
      direction: 'wait',
      weight: 0.4,
      detail: `At $${currentPrice}, this is above median ($${median}) but below the 75th percentile ($${third}). Room to drop.`,
    };
  } else {
    return {
      name: 'Historical Position',
      direction: 'wait',
      weight: 0.7,
      detail: `At $${currentPrice}, this is above the 75th percentile ($${third}). Historically overpriced — strong chance of a drop.`,
    };
  }
}

function analyzeCompetition(offers: FlightOffer[]): PredictionSignal {
  const carriers = new Set(offers.map(o => o.carrier));
  const carrierCount = carriers.size;

  if (carrierCount >= 4) {
    return {
      name: 'Carrier Competition',
      direction: 'wait',
      weight: 0.3,
      detail: `${carrierCount} airlines competing on this route — high competition often drives prices down.`,
    };
  } else if (carrierCount >= 2) {
    return {
      name: 'Carrier Competition',
      direction: 'neutral',
      weight: 0.1,
      detail: `${carrierCount} airlines on this route — moderate competition.`,
    };
  } else {
    return {
      name: 'Carrier Competition',
      direction: 'buy',
      weight: -0.3,
      detail: 'Limited carrier competition — monopoly routes rarely see drops.',
    };
  }
}

function analyzePriceSpread(offers: FlightOffer[]): PredictionSignal {
  if (offers.length < 2) {
    return { name: 'Price Spread', direction: 'neutral', weight: 0, detail: 'Insufficient offers to analyze spread.' };
  }

  const prices = offers.map(o => o.price).sort((a, b) => a - b);
  const cheapest = prices[0];
  const mostExpensive = prices[prices.length - 1];
  const spread = ((mostExpensive - cheapest) / cheapest) * 100;

  if (spread > 60) {
    return {
      name: 'Price Spread',
      direction: 'wait',
      weight: 0.3,
      detail: `${Math.round(spread)}% price spread — volatile route with room for deals.`,
    };
  } else if (spread < 15) {
    return {
      name: 'Price Spread',
      direction: 'buy',
      weight: -0.2,
      detail: `Only ${Math.round(spread)}% spread — prices are tightly clustered and stable.`,
    };
  }

  return {
    name: 'Price Spread',
    direction: 'neutral',
    weight: 0,
    detail: `${Math.round(spread)}% price spread — moderate volatility.`,
  };
}

function analyzeSeasonality(departDate: string): PredictionSignal {
  const month = new Date(departDate + 'T00:00:00').getMonth();

  const seasonScores: Record<number, { score: number; label: string }> = {
    0: { score: 0.3, label: 'January — off-peak, prices tend to be lower' },
    1: { score: 0.3, label: 'February — off-peak, good for deals' },
    2: { score: -0.1, label: 'March — spring break demand pushes prices up' },
    3: { score: 0.1, label: 'April — post-spring-break lull' },
    4: { score: -0.1, label: 'May — early summer demand building' },
    5: { score: -0.4, label: 'June — peak summer travel, prices are high' },
    6: { score: -0.5, label: 'July — peak summer, highest demand' },
    7: { score: -0.4, label: 'August — still peak, but late bookings sometimes drop' },
    8: { score: 0.4, label: 'September — off-peak shoulder season, great for deals' },
    9: { score: 0.3, label: 'October — off-peak, generally good prices' },
    10: { score: 0.1, label: 'November — mixed (Thanksgiving spike)' },
    11: { score: -0.3, label: 'December — holiday travel premium' },
  };

  const { score, label } = seasonScores[month];
  return {
    name: 'Seasonality',
    direction: score > 0 ? 'wait' : score < 0 ? 'buy' : 'neutral',
    weight: score,
    detail: label,
  };
}

// === MAIN PREDICTION FUNCTION ===

export function generatePrediction(input: PredictionInput): PredictionResult {
  const daysOut = Math.ceil(
    (new Date(input.departDate + 'T00:00:00').getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const signals: PredictionSignal[] = [
    analyzeAdvancePurchase(daysOut),
    analyzeDayOfWeek(input.departDate),
    analyzePricePosition(input.currentBestPrice, input.priceAnalysis),
    analyzeCompetition(input.allOffers),
    analyzePriceSpread(input.allOffers),
    analyzeSeasonality(input.departDate),
  ];

  const totalWeight = signals.reduce((sum, s) => sum + Math.abs(s.weight), 0);
  const weightedScore = signals.reduce((sum, s) => sum + s.weight, 0) / Math.max(totalWeight, 1);

  const action: 'BUY' | 'WAIT' = weightedScore < 0 ? 'BUY' : 'WAIT';
  const confidence = Math.min(0.95, 0.5 + Math.abs(weightedScore) * 0.5);

  let predictedSavings = 0;
  let predictedDaysToDrop = 0;

  if (action === 'WAIT' && input.priceAnalysis) {
    const { first, median } = input.priceAnalysis;
    const targetPrice = (first + median) / 2;
    predictedSavings = Math.max(0, Math.round(input.currentBestPrice - targetPrice));
    predictedDaysToDrop = Math.min(daysOut - 7, Math.max(3, Math.round(daysOut * 0.3)));
  } else if (action === 'WAIT') {
    predictedSavings = Math.round(input.currentBestPrice * 0.1);
    predictedDaysToDrop = Math.min(daysOut - 7, 14);
  }

  const topSignals = [...signals]
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 3);

  const reasoning = topSignals.map(s => s.detail).join(' ');

  const forecast = generateForecast(input, action, predictedSavings, predictedDaysToDrop, daysOut);

  return {
    action,
    confidence,
    predictedSavings,
    predictedDaysToDrop,
    reasoning,
    forecast,
    signals,
  };
}

// Seeded PRNG to avoid SSR hydration mismatches
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateForecast(
  input: PredictionInput,
  action: 'BUY' | 'WAIT',
  savings: number,
  daysToDrop: number,
  daysOut: number
): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  const basePrice = input.currentBestPrice;

  // Deterministic seed based on inputs
  const seed = Math.abs(
    input.origin.charCodeAt(0) * 1000000 +
    input.destination.charCodeAt(0) * 10000 +
    basePrice * 100 +
    daysOut
  );
  const rand = seededRandom(seed);

  for (let d = 0; d <= 30; d++) {
    const daysUntilFlight = daysOut - d;
    if (daysUntilFlight <= 0) break;

    let predictedPrice: number;

    if (action === 'WAIT' && d <= daysToDrop) {
      const progress = d / daysToDrop;
      const eased = 1 - Math.pow(1 - progress, 2);
      predictedPrice = basePrice - (savings * eased);
    } else if (action === 'WAIT' && d > daysToDrop) {
      const daysAfterLow = d - daysToDrop;
      const climbRate = Math.min(daysAfterLow * (savings / 15), savings * 1.5);
      predictedPrice = (basePrice - savings) + climbRate;
    } else {
      const dailyIncrease = basePrice * 0.005 * (1 + (30 - daysUntilFlight) / 30);
      predictedPrice = basePrice + (dailyIncrease * d);
    }

    // Deterministic noise using seeded PRNG
    const noise = (rand() - 0.5) * basePrice * 0.03;
    predictedPrice = Math.round(predictedPrice + noise);

    const confidence = Math.max(0.3, 0.9 - (d * 0.02));
    points.push({ daysFromNow: d, predictedPrice, confidence });
  }

  return points;
}
