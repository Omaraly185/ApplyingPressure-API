CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  date_time TIMESTAMPTZ,
  service TEXT,
  service_price NUMERIC(10, 2),
  total NUMERIC(10, 2),
  car_type TEXT,
  address TEXT,
  zipcode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
