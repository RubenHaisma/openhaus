/*
  # Create WOZ Cache Table

  1. New Tables
    - `woz_cache`
      - `id` (uuid, primary key)
      - `address` (text)
      - `postal_code` (text)
      - `woz_value` (integer)
      - `reference_year` (integer)
      - `object_type` (text)
      - `surface_area` (decimal, optional)
      - `scraped_at` (timestamp)
      - `source_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. New Tables
    - `market_data_cache`
      - `id` (uuid, primary key)
      - `postal_code_area` (text, unique)
      - `market_multiplier` (decimal)
      - `updated_at` (timestamp)
      - `created_at` (timestamp)

  3. Security
    - Enable RLS on both tables
    - Add policies for public read access (for property valuations)
*/

-- Create WOZ cache table
CREATE TABLE IF NOT EXISTS woz_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  postal_code text NOT NULL,
  woz_value integer NOT NULL,
  reference_year integer NOT NULL,
  object_type text NOT NULL DEFAULT 'Woning',
  surface_area decimal(10,2),
  scraped_at timestamptz NOT NULL DEFAULT now(),
  source_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(address, postal_code)
);

-- Create market data cache table
CREATE TABLE IF NOT EXISTS market_data_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  postal_code_area text UNIQUE NOT NULL,
  market_multiplier decimal(5,4) NOT NULL DEFAULT 1.15,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_woz_cache_postal_code ON woz_cache(postal_code);
CREATE INDEX IF NOT EXISTS idx_woz_cache_scraped_at ON woz_cache(scraped_at);
CREATE INDEX IF NOT EXISTS idx_market_data_postal_area ON market_data_cache(postal_code_area);

-- Enable Row Level Security
ALTER TABLE woz_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (needed for property valuations)
CREATE POLICY "Allow public read access to WOZ cache"
  ON woz_cache
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to market data cache"
  ON market_data_cache
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert WOZ cache"
  ON woz_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update WOZ cache"
  ON woz_cache
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert market data cache"
  ON market_data_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update market data cache"
  ON market_data_cache
  FOR UPDATE
  TO authenticated
  USING (true);