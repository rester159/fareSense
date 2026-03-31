'use client';

import type { PredictionResult } from '@/types/prediction';
import { formatPrice } from '@/lib/formatters';
import ConfidenceMeter from './ConfidenceMeter';
import Card from './ui/Card';

interface PredictionHeroProps {
  prediction: PredictionResult;
  currentBestPrice: number;
  carrier: string;
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
}

const SIGNAL_ICONS: Record<string, React.ReactNode> = {
  'Historical Position': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  'Advance Purchase': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  'Carrier Competition': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
    </svg>
  ),
  'Seasonality': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
    </svg>
  ),
  'Departure Day': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  'Price Spread': (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3"/>
    </svg>
  ),
};

export default function PredictionHero({
  prediction,
  currentBestPrice,
  carrier,
}: PredictionHeroProps) {
  const isWait = prediction.action === 'WAIT';
  const confidencePercent = Math.round(prediction.confidence * 100);
  const predictedLow = currentBestPrice - prediction.predictedSavings;

  const topSignals = [...prediction.signals]
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight))
    .slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Main Prediction Card */}
      <Card glow={isWait ? 'teal' : 'amber'} className="p-6 animate-fade-in-up">
        {/* Action Badge */}
        <div className="text-center mb-4">
          <span
            className={`inline-block text-3xl font-black tracking-[0.2em] font-[var(--font-display)] ${
              isWait ? 'text-teal' : 'text-amber'
            }`}
          >
            {prediction.action}
          </span>
        </div>

        {/* Confidence subtitle */}
        <p className="text-center text-text-secondary text-sm mb-5">
          {confidencePercent}% confident this {isWait ? 'drops' : 'is near its lowest'}
        </p>

        {/* MASSIVE Savings Amount */}
        {isWait && prediction.predictedSavings > 0 && (
          <div className="text-center mb-2 animate-count-up delay-300">
            <div className="relative inline-block">
              <span
                className={`text-6xl font-black font-[var(--font-display)] ${
                  isWait ? 'text-teal' : 'text-amber'
                }`}
                style={{
                  textShadow: isWait
                    ? '0 0 40px rgba(0,212,170,0.3), 0 0 80px rgba(0,212,170,0.15)'
                    : '0 0 40px rgba(255,159,28,0.3), 0 0 80px rgba(255,159,28,0.15)',
                }}
              >
                {formatPrice(prediction.predictedSavings)}
              </span>
            </div>
            <p className="text-text-secondary text-sm mt-1">
              in about {prediction.predictedDaysToDrop} days
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-surface-border my-5" />

        {/* Price comparison */}
        <div className="flex justify-between items-center text-sm">
          <div>
            <div className="text-text-muted text-xs mb-0.5">Current best</div>
            <div className="text-text-primary font-semibold">
              {formatPrice(currentBestPrice)}
              <span className="text-text-muted font-normal ml-1">({carrier})</span>
            </div>
          </div>
          {isWait && (
            <div className="text-right">
              <div className="text-text-muted text-xs mb-0.5">Predicted low</div>
              <div className={`font-semibold ${isWait ? 'text-teal' : 'text-amber'}`}>
                ~{formatPrice(predictedLow)}
              </div>
            </div>
          )}
        </div>

        {/* Confidence Meter */}
        <div className="mt-5">
          <ConfidenceMeter confidence={prediction.confidence} action={prediction.action} />
        </div>
      </Card>

      {/* Signals */}
      <div className="animate-fade-in-up delay-400">
        <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">Why</h3>
        <div className="space-y-2">
          {topSignals.map((signal, i) => (
            <Card key={signal.name} className="p-4 animate-slide-in" style={{ animationDelay: `${500 + i * 100}ms` }}>
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 ${
                  signal.direction === 'wait' ? 'text-teal' : signal.direction === 'buy' ? 'text-amber' : 'text-text-muted'
                }`}>
                  {SIGNAL_ICONS[signal.name] || (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-text-primary text-sm font-medium">{signal.name}</div>
                  <div className="text-text-secondary text-xs mt-0.5 leading-relaxed">{signal.detail}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
