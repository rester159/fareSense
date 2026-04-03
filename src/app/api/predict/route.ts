import { NextRequest, NextResponse } from 'next/server';
import { generatePrediction } from '@/lib/prediction';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { origin, destination, departDate, returnDate, currentBestPrice, priceAnalysis, allOffers } = body;

    if (!origin || !destination || !departDate || !currentBestPrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const prediction = generatePrediction({
      origin,
      destination,
      departDate,
      returnDate,
      currentBestPrice,
      priceAnalysis,
      allOffers: allOffers || [],
    });

    return NextResponse.json(prediction);
  } catch (error: any) {
    console.error('Prediction error:', error);
    return NextResponse.json(
      { error: 'Prediction failed', detail: error.message },
      { status: 500 }
    );
  }
}
