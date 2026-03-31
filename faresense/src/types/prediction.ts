export interface PredictionSignal {
  name: string;
  direction: 'buy' | 'wait' | 'neutral';
  weight: number;
  detail: string;
}

export interface ForecastPoint {
  daysFromNow: number;
  predictedPrice: number;
  confidence: number;
}

export interface PredictionResult {
  action: 'BUY' | 'WAIT';
  confidence: number;
  predictedSavings: number;
  predictedDaysToDrop: number;
  reasoning: string;
  forecast: ForecastPoint[];
  signals: PredictionSignal[];
}

export interface PredictionInput {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  currentBestPrice: number;
  priceAnalysis: import('./flight').PriceAnalysisData | null;
  allOffers: import('./flight').FlightOffer[];
}
