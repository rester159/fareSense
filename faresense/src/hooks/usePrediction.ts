'use client';

import { useState, useCallback } from 'react';
import type { PredictionResult } from '@/types/prediction';
import type { FlightOffer, PriceAnalysisData } from '@/types/flight';

export function usePrediction() {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = useCallback(async (params: {
    origin: string;
    destination: string;
    departDate: string;
    returnDate?: string;
    currentBestPrice: number;
    priceAnalysis: PriceAnalysisData | null;
    allOffers: FlightOffer[];
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Prediction failed' }));
        throw new Error(err.error || 'Prediction failed');
      }

      const result: PredictionResult = await res.json();
      setPrediction(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { prediction, loading, error, predict };
}
