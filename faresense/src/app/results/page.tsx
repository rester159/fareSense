'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import type { SearchResult } from '@/types/flight';
import type { PredictionResult } from '@/types/prediction';
import { getAirport } from '@/lib/airports';
import { formatDate, formatCarrier } from '@/lib/formatters';
import PredictionHero from '@/components/PredictionHero';
import ForecastChart from '@/components/ForecastChart';
import FareList from '@/components/FareList';
import WatchButton from '@/components/WatchButton';
import Button from '@/components/ui/Button';

function LoadingSkeleton() {
  const messages = [
    'Scanning flight databases...',
    'Analyzing historical pricing...',
    'Running prediction models...',
    'Calculating optimal timing...',
  ];
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-surface-border" />
        <div className="absolute inset-0 rounded-full border-2 border-teal border-t-transparent animate-spin" />
      </div>
      <p className="text-text-primary font-semibold text-lg animate-fade-in">
        {messages[msgIdx]}
      </p>
      <p className="text-text-muted text-sm mt-2">
        Analyzing 847 data points
      </p>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-amber" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4M12 17h.01"/>
        </svg>
      </div>
      <h2 className="text-text-primary font-semibold text-lg mb-2">Something went wrong</h2>
      <p className="text-text-secondary text-sm mb-6 max-w-xs">{message}</p>
      <Button variant="secondary" onClick={onRetry}>Try Again</Button>
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departDate = searchParams.get('departDate') || '';
  const returnDate = searchParams.get('returnDate') || undefined;

  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!origin || !destination || !departDate) {
      setError('Missing search parameters');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Search flights
      const searchParams = new URLSearchParams({ origin, destination, departDate });
      if (returnDate) searchParams.set('returnDate', returnDate);

      const searchRes = await fetch(`/api/search?${searchParams}`);
      if (!searchRes.ok) {
        throw new Error('Flight search failed. Please try again.');
      }
      const searchResult: SearchResult = await searchRes.json();
      setSearchData(searchResult);

      if (!searchResult.offers.length) {
        throw new Error('No flights found for this route and date. Try different dates.');
      }

      // Step 2: Get prediction
      const bestPrice = Math.min(...searchResult.offers.map(o => o.price));
      const predictRes = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          departDate,
          returnDate,
          currentBestPrice: bestPrice,
          priceAnalysis: searchResult.priceAnalysis,
          allOffers: searchResult.offers,
        }),
      });

      if (!predictRes.ok) {
        throw new Error('Prediction failed. Please try again.');
      }

      const predictionResult: PredictionResult = await predictRes.json();
      setPrediction(predictionResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [origin, destination, departDate, returnDate]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!searchData || !prediction) return null;

  const bestOffer = [...searchData.offers].sort((a, b) => a.price - b.price)[0];
  const originAirport = getAirport(origin);
  const destAirport = getAirport(destination);

  const routeLabel = `${originAirport?.city || origin} → ${destAirport?.city || destination}`;

  return (
    <div className="flex flex-col min-h-dvh pb-24">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-navy/90 backdrop-blur-xl border-b border-surface-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-9 h-9 rounded-xl bg-surface-light border border-surface-border flex items-center justify-center text-text-muted hover:text-text-primary transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <div className="min-w-0">
            <div className="text-text-primary font-semibold text-sm truncate">
              {origin} → {destination}
            </div>
            <div className="text-text-muted text-xs">
              {formatDate(departDate)}
              {returnDate ? ` — ${formatDate(returnDate)}` : ' · One way'}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pt-5 pb-6">
        <div className="max-w-lg mx-auto space-y-5">
          {/* Prediction Hero */}
          <PredictionHero
            prediction={prediction}
            currentBestPrice={bestOffer.price}
            carrier={formatCarrier(bestOffer.carrier)}
            origin={origin}
            destination={destination}
            departDate={departDate}
            returnDate={returnDate}
          />

          {/* Forecast Chart */}
          <ForecastChart
            forecast={prediction.forecast}
            currentPrice={bestOffer.price}
            action={prediction.action}
            predictedDaysToDrop={prediction.predictedDaysToDrop}
          />

          {/* Fare List */}
          <FareList offers={searchData.offers} />
        </div>
      </main>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-xl border-t border-surface-border px-4 py-3 pb-safe">
        <div className="max-w-lg mx-auto flex gap-3">
          <WatchButton
            origin={origin}
            destination={destination}
            departDate={departDate}
            returnDate={returnDate}
          />
          <Button
            variant="secondary"
            size="lg"
            className="flex-1"
            onClick={() => {
              // Phase 2: deep link to booking
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ResultsContent />
    </Suspense>
  );
}
