export interface WatchedTrip {
  id: string;
  user_id: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string | null;
  current_best_price: number | null;
  predicted_low_price: number | null;
  prediction_action: 'BUY' | 'WAIT' | null;
  prediction_confidence: number | null;
  predicted_drop_amount: number | null;
  predicted_days_to_drop: number | null;
  last_checked_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PriceSnapshot {
  id: string;
  watched_trip_id: string;
  price: number;
  carrier: string | null;
  recorded_at: string;
}
