import type { FlightOffer } from '@/types/flight';
import { formatPrice, formatDuration, formatStops, formatCarrier } from '@/lib/formatters';
import Card from './ui/Card';

interface FareCardProps {
  offer: FlightOffer;
  isCheapest?: boolean;
}

export default function FareCard({ offer, isCheapest }: FareCardProps) {
  const outbound = offer.segments[0];

  return (
    <Card className={`p-4 ${isCheapest ? 'border-teal/20' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-text-primary font-semibold text-sm">
              {formatCarrier(offer.carrier)}
            </span>
            {isCheapest && (
              <span className="text-[10px] font-bold text-teal bg-teal/10 px-2 py-0.5 rounded-full">
                BEST
              </span>
            )}
          </div>
          {outbound && (
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <span>{formatStops(outbound.stops)}</span>
              <span className="text-surface-border">|</span>
              <span>{formatDuration(outbound.duration)}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          <div className={`text-xl font-bold ${isCheapest ? 'text-teal' : 'text-text-primary'}`}>
            {formatPrice(offer.price)}
          </div>
          <div className="text-text-muted text-xs">per person</div>
        </div>
      </div>
    </Card>
  );
}
