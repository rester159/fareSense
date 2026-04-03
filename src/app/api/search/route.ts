import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, deriveQuartiles, secondsToIsoDuration } from '@/lib/kiwi';

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
    const kiwiData = await searchFlights({
      origin,
      destination,
      departDate,
      returnDate: returnDate || undefined,
      maxOffers: 20,
    });

    const offers = (kiwiData.data || []).map((flight: any) => {
      // Split route into outbound and return segments
      const outboundSegments = flight.route.filter(
        (seg: any) => seg.return === 0
      );
      const returnSegments = flight.route.filter(
        (seg: any) => seg.return === 1
      );

      const mapSegments = (segs: any[]) =>
        segs.map((seg: any) => ({
          departure: { airport: seg.flyFrom, time: seg.local_departure },
          arrival: { airport: seg.flyTo, time: seg.local_arrival },
          carrier: seg.airline,
          flightNumber: `${seg.airline}${seg.flight_no}`,
          duration: secondsToIsoDuration(
            (seg.aTime || 0) - (seg.dTime || 0)
          ),
        }));

      const itineraries = [];
      if (outboundSegments.length > 0) {
        itineraries.push({
          duration: secondsToIsoDuration(flight.duration?.departure || 0),
          stops: outboundSegments.length - 1,
          segments: mapSegments(outboundSegments),
        });
      }
      if (returnSegments.length > 0) {
        itineraries.push({
          duration: secondsToIsoDuration(flight.duration?.return || 0),
          stops: returnSegments.length - 1,
          segments: mapSegments(returnSegments),
        });
      }

      return {
        id: flight.id,
        price: flight.price,
        currency: kiwiData.currency || 'USD',
        carrier: flight.airlines?.[0] || 'Unknown',
        segments: itineraries,
        bookingToken: flight.booking_token,
        deepLink: flight.deep_link,
      };
    });

    const prices = offers.map((o: any) => o.price);
    const priceAnalysis = deriveQuartiles(prices);

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
