interface AmadeusToken {
  access_token: string;
  expires_at: number;
}

let cachedToken: AmadeusToken | null = null;

function getBaseUrl(): string {
  return process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at) {
    return cachedToken.access_token;
  }

  const res = await fetch(`${getBaseUrl()}/v1/security/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) {
    throw new Error(`Amadeus auth failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = {
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in - 60) * 1000,
  };
  return cachedToken.access_token;
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
  const token = await getToken();
  const searchParams = new URLSearchParams({
    originLocationCode: params.origin,
    destinationLocationCode: params.destination,
    departureDate: params.departDate,
    adults: String(params.adults || 1),
    max: String(params.maxOffers || 20),
    currencyCode: params.currencyCode || 'USD',
  });

  if (params.returnDate) {
    searchParams.set('returnDate', params.returnDate);
  }

  const res = await fetch(
    `${getBaseUrl()}/v2/shopping/flight-offers?${searchParams}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`Amadeus search failed: ${JSON.stringify(error)}`);
  }

  return res.json();
}

export async function getPriceAnalysis(params: {
  origin: string;
  destination: string;
  departDate: string;
  currencyCode?: string;
}) {
  const token = await getToken();
  const searchParams = new URLSearchParams({
    originIataCode: params.origin,
    destinationIataCode: params.destination,
    departureDate: params.departDate,
    currencyCode: params.currencyCode || 'USD',
  });

  const res = await fetch(
    `${getBaseUrl()}/v1/analytics/itinerary-price-metrics?${searchParams}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    return null;
  }

  return res.json();
}
