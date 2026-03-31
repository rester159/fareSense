import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, getPriceAnalysis } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin')?.toUpperCase();
  const destination = searchParams.get('destination')?.toUpperCase();
  const departDate = searchParams.get('departDate');
  const returnDate = searchParams.get('returnDate');

  if (!origin || !destination || !departDate) {
    return NextResponse.json(
      { error: 'origin, destination, and departDate are required' },
      { status: 400 }
    );
  }

  try {
    const [flightData, priceAnalysisData] = await Promise.all([
      searchFlights({
        origin,
        destination,
        departDate,
        returnDate: returnDate || undefined,
        maxOffers: 20,
      }),
      getPriceAnalysis({ origin, destination, departDate }),
    ]);

    const offers = (flightData.data || []).map((offer: any) => ({
      id: offer.id,
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      carrier: offer.validatingAirlineCodes?.[0] || 'Unknown',
      segments: (offer.itineraries || []).map((itin: any) => ({
        duration: itin.duration,
        stops: itin.segments.length - 1,
        segments: itin.segments.map((seg: any) => ({
          departure: { airport: seg.departure.iataCode, time: seg.departure.at },
          arrival: { airport: seg.arrival.iataCode, time: seg.arrival.at },
          carrier: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          duration: seg.duration,
        })),
      })),
    }));

    let priceAnalysis = null;
    if (priceAnalysisData?.data?.[0]?.priceMetrics) {
      const metrics = priceAnalysisData.data[0].priceMetrics;
      const getAmount = (quartile: string) => {
        const m = metrics.find((pm: any) => pm.quartileRanking === quartile);
        return m ? parseFloat(m.amount) : null;
      };

      priceAnalysis = {
        first: getAmount('FIRST'),
        median: getAmount('MEDIUM'),
        third: getAmount('THIRD'),
      };
    }

    return NextResponse.json({
      offers,
      priceAnalysis,
      meta: { origin, destination, departDate, returnDate, totalOffers: offers.length },
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to search flights', detail: error.message },
      { status: 500 }
    );
  }
}
