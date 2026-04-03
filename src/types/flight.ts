export interface FlightSegment {
  departure: {
    airport: string;
    time: string;
  };
  arrival: {
    airport: string;
    time: string;
  };
  carrier: string;
  flightNumber: string;
  duration: string;
}

export interface FlightItinerary {
  duration: string;
  stops: number;
  segments: FlightSegment[];
}

export interface FlightOffer {
  id: string;
  price: number;
  currency: string;
  carrier: string;
  segments: FlightItinerary[];
  bookingToken?: string;
  deepLink?: string;
}

export interface PriceAnalysisData {
  first: number;   // Q1 — 25th percentile
  median: number;  // Q2 — 50th percentile
  third: number;   // Q3 — 75th percentile
}

export interface SearchResult {
  offers: FlightOffer[];
  priceAnalysis: PriceAnalysisData | null;
  meta: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate: string | null;
    totalOffers: number;
  };
}
