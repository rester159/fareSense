const BASE_URL = 'https://tequila-api.kiwi.com';

function getApiKey(): string {
  const key = process.env.KIWI_API_KEY;
  if (!key) throw new Error('KIWI_API_KEY is not set');
  return key;
}

function toKiwiDate(isoDate: string): string {
  // Convert YYYY-MM-DD → DD/MM/YYYY
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults?: number;
  maxOffers?: number;
  currencyCode?: string;
}) {
  const searchParams = new URLSearchParams({
    fly_from: params.origin,
    fly_to: params.destination,
    dateFrom: toKiwiDate(params.departDate),
    dateTo: toKiwiDate(params.departDate),
    adults: String(params.adults || 1),
    limit: String(params.maxOffers || 20),
    curr: params.currencyCode || 'USD',
    sort: 'price',
    asc: '1',
  });

  if (params.returnDate) {
    searchParams.set('flight_type', 'round');
    searchParams.set('returnFrom', toKiwiDate(params.returnDate));
    searchParams.set('returnTo', toKiwiDate(params.returnDate));
  } else {
    searchParams.set('flight_type', 'oneway');
  }

  const res = await fetch(`${BASE_URL}/v2/search?${searchParams}`, {
    headers: { apikey: getApiKey() },
  });

  if (!res.ok) {
    const error = await res.text().catch(() => res.statusText);
    throw new Error(`Kiwi search failed (${res.status}): ${error}`);
  }

  return res.json();
}

export function deriveQuartiles(prices: number[]) {
  if (prices.length < 3) return null;

  const sorted = [...prices].sort((a, b) => a - b);
  const q = (p: number) => {
    const idx = (sorted.length - 1) * p;
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  };

  return {
    first: Math.round(q(0.25)),
    median: Math.round(q(0.5)),
    third: Math.round(q(0.75)),
  };
}

export function secondsToIsoDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  let iso = 'PT';
  if (h > 0) iso += `${h}H`;
  if (m > 0) iso += `${m}M`;
  return iso || 'PT0M';
}
