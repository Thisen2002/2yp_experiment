-- =====================================================
-- Navigation Graph Database Schema
-- Tables for storing nodes and edges for pathfinding
-- =====================================================
-- Drop existing tables if they exist
DROP TABLE IF EXISTS navigation_edges CASCADE;
DROP TABLE IF EXISTS navigation_nodes CASCADE;
-- =====================================================
-- NODES TABLE
-- Stores navigation graph nodes with coordinates
-- =====================================================
CREATE TABLE navigation_nodes (
  node_id SERIAL PRIMARY KEY,
  node_index INTEGER NOT NULL UNIQUE,
  -- The array index (0-97)
  latitude DECIMAL(10, 8) NOT NULL,
  -- 8 decimal places for precision
  longitude DECIMAL(11, 8) NOT NULL,
  -- 8 decimal places for precision
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Constraints
  CONSTRAINT valid_latitude CHECK (
    latitude BETWEEN -90 AND 90
  ),
  CONSTRAINT valid_longitude CHECK (
    longitude BETWEEN -180 AND 180
  )
);
-- Index for faster lookups by node_index
CREATE INDEX idx_node_index ON navigation_nodes(node_index);
CREATE INDEX idx_node_coords ON navigation_nodes(latitude, longitude);
-- =====================================================
-- EDGES TABLE
-- Stores connections between nodes with path coordinates
-- =====================================================
CREATE TABLE navigation_edges (
  edge_id SERIAL PRIMARY KEY,
  edge_code VARCHAR(20) NOT NULL UNIQUE,
  -- e.g., "0_1", "1_2"
  from_node INTEGER NOT NULL,
  -- Source node index
  to_node INTEGER NOT NULL,
  -- Destination node index
  path_coordinates JSONB NOT NULL,
  -- Array of [lat, lng] coordinates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  -- Foreign key constraints
  CONSTRAINT fk_from_node FOREIGN KEY (from_node) REFERENCES navigation_nodes(node_index) ON DELETE CASCADE,
  CONSTRAINT fk_to_node FOREIGN KEY (to_node) REFERENCES navigation_nodes(node_index) ON DELETE CASCADE,
  -- Prevent duplicate edges
  CONSTRAINT unique_edge UNIQUE (from_node, to_node)
);
-- Indexes for faster edge lookups
CREATE INDEX idx_from_node ON navigation_edges(from_node);
CREATE INDEX idx_to_node ON navigation_edges(to_node);
CREATE INDEX idx_edge_code ON navigation_edges(edge_code);
-- =====================================================
-- TRIGGER: Update timestamp on modification
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_nodes_updated_at BEFORE
UPDATE ON navigation_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_edges_updated_at BEFORE
UPDATE ON navigation_edges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE navigation_nodes IS 'Stores navigation graph nodes with geographic coordinates';
COMMENT ON TABLE navigation_edges IS 'Stores edges connecting nodes with path coordinate arrays';
COMMENT ON COLUMN navigation_edges.path_coordinates IS 'JSONB array of coordinate pairs [[lat, lng], ...]';