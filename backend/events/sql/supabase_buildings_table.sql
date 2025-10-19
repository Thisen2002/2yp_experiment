-- ======================== SUPABASE TABLE CREATION SCRIPT ========================
-- Run this SQL in your Supabase SQL Editor to create the buildings table for sync

-- Create the buildings table that matches your local database structure
CREATE TABLE IF NOT EXISTS buildings (
  building_id text PRIMARY KEY,
  building_name text NOT NULL,
  building_capacity integer NOT NULL CHECK (building_capacity > 0),
  current_count integer DEFAULT 0 CHECK (current_count >= 0),
  color text DEFAULT '#cccccc',
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Add some indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buildings_last_updated ON buildings(last_updated);
CREATE INDEX IF NOT EXISTS idx_buildings_current_count ON buildings(current_count);

-- Enable Row Level Security (optional - you can disable this if you want full access)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can customize this based on your security needs)
CREATE POLICY "Allow all operations on buildings" 
ON buildings 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Optional: Create a function to automatically update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update last_updated when a row is modified
CREATE TRIGGER update_buildings_updated_at 
    BEFORE UPDATE ON buildings 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the table was created successfully
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'buildings' 
ORDER BY ordinal_position;