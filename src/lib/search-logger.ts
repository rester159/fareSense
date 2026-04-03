import { getDb } from './db';
import type { PriceAnalysisData } from '@/types/flight';

interface LogMeta {
  origin: string;
  destination: string;
  departDate: string;
  returnDate: string | null;
}

interface LogOffer {
  id: string;
  price: number;
  currency: string;
  carrier: string;
  segments: { stops: number; duration: string }[];
  bookingToken?: string;
}

export async function logSearch(
  meta: LogMeta,
  offers: LogOffer[],
  priceAnalysis: PriceAnalysisData | null
) {
  try {
    const sql = getDb();
    const prices = offers.map(o => o.price).sort((a, b) => a - b);
    const carriers = [...new Set(offers.map(o => o.carrier))];

    const [row] = await sql`
      INSERT INTO search_logs (
        origin, destination, depart_date, return_date,
        currency, num_offers, min_price, median_price, max_price,
        q1_price, q3_price, carriers
      ) VALUES (
        ${meta.origin}, ${meta.destination}, ${meta.departDate},
        ${meta.returnDate}, ${offers[0]?.currency || 'USD'},
        ${offers.length},
        ${prices[0] ?? null},
        ${priceAnalysis?.median ?? null},
        ${prices[prices.length - 1] ?? null},
        ${priceAnalysis?.first ?? null},
        ${priceAnalysis?.third ?? null},
        ${carriers}
      ) RETURNING id
    `;

    if (offers.length > 0) {
      const searchId = row.id;
      for (const offer of offers) {
        const outbound = offer.segments[0];
        const durationMatch = outbound?.duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
        const durationSec = durationMatch
          ? (parseInt(durationMatch[1] || '0') * 3600 + parseInt(durationMatch[2] || '0') * 60)
          : null;

        await sql`
          INSERT INTO offer_logs (
            search_id, kiwi_offer_id, price, carrier, stops,
            duration_seconds, booking_token
          ) VALUES (
            ${searchId}, ${offer.id}, ${offer.price}, ${offer.carrier},
            ${outbound?.stops ?? 0}, ${durationSec}, ${offer.bookingToken ?? null}
          )
        `;
      }
    }
  } catch (err) {
    console.error('Search logging failed (non-blocking):', err);
  }
}
