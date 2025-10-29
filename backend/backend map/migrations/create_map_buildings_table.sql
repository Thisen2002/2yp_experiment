-- Create MapBuildings table
-- This table stores all building data previously in shared/buildings.json
CREATE TABLE IF NOT EXISTS map_buildings (
  building_id INTEGER PRIMARY KEY,
  building_name TEXT NOT NULL,
  description TEXT,
  svg_id TEXT NOT NULL,
  -- Removed UNIQUE constraint (multiple buildings can share same SVG element)
  node_id INTEGER REFERENCES navigation_nodes(node_index) ON DELETE
  SET NULL,
    zone_id INTEGER,
    exhibits JSONB DEFAULT '[]',
    coordinates JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_map_buildings_svg_id ON map_buildings(svg_id);
CREATE INDEX IF NOT EXISTS idx_map_buildings_node_id ON map_buildings(node_id);
CREATE INDEX IF NOT EXISTS idx_map_buildings_zone_id ON map_buildings(zone_id);
CREATE INDEX IF NOT EXISTS idx_map_buildings_name ON map_buildings(building_name);
-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_map_buildings_timestamp() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trigger_update_map_buildings_timestamp BEFORE
UPDATE ON map_buildings FOR EACH ROW EXECUTE FUNCTION update_map_buildings_timestamp();
COMMENT ON TABLE map_buildings IS 'Stores all building information for the map system';
COMMENT ON COLUMN map_buildings.building_id IS 'Unique building identifier (from legacy system)';
COMMENT ON COLUMN map_buildings.svg_id IS 'SVG element ID for map highlighting (e.g., b11, b32)';
COMMENT ON COLUMN map_buildings.node_id IS 'Navigation node ID for routing (can be null)';
COMMENT ON COLUMN map_buildings.zone_id IS 'Zone identifier for grouping buildings';
COMMENT ON COLUMN map_buildings.exhibits IS 'Array of exhibits in this building (JSONB)';
COMMENT ON COLUMN map_buildings.coordinates IS 'Geographic coordinates [lat, lng] (JSONB)';