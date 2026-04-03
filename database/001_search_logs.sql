CREATE TABLE search_logs (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  depart_date DATE NOT NULL,
  return_date DATE,
  searched_at TIMESTAMPTZ DEFAULT NOW(),
  currency TEXT DEFAULT 'USD',
  num_offers INT,
  min_price NUMERIC,
  median_price NUMERIC,
  max_price NUMERIC,
  q1_price NUMERIC,
  q3_price NUMERIC,
  carriers TEXT[]
);

CREATE TABLE offer_logs (
  id SERIAL PRIMARY KEY,
  search_id INT REFERENCES search_logs(id),
  kiwi_offer_id TEXT,
  price NUMERIC NOT NULL,
  carrier TEXT,
  stops INT,
  duration_seconds INT,
  booking_token TEXT
);

CREATE INDEX idx_search_route ON search_logs(origin, destination, depart_date);
CREATE INDEX idx_search_time ON search_logs(searched_at);
CREATE INDEX idx_offer_search ON offer_logs(search_id);
