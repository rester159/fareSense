import type { FlightOffer } from '@/types/flight';
import FareCard from './FareCard';

interface FareListProps {
  offers: FlightOffer[];
}

export default function FareList({ offers }: FareListProps) {
  if (!offers.length) return null;

  const sorted = [...offers].sort((a, b) => a.price - b.price);
  const cheapestPrice = sorted[0]?.price;

  return (
    <div className="animate-fade-in-up delay-700">
      <h3 className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3 px-1">
        Available Fares
      </h3>
      <div className="space-y-2">
        {sorted.slice(0, 6).map((offer) => (
          <FareCard
            key={offer.id}
            offer={offer}
            isCheapest={offer.price === cheapestPrice}
          />
        ))}
      </div>
    </div>
  );
}
