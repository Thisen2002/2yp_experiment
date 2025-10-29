/**
 * Building Service - Database operations for map_buildings table
 * Replaces the old buildings.json file with database queries
 * 
 * API Endpoints using this service:
 * - GET /api/map/buildings              → getAllBuildings()
 * - GET /api/map/buildings/mappings     → getMappings()
 * - GET /api/map/buildings/search?q=... → searchBuildings(query, options)
 * - GET /api/map/buildings/:id          → getBuildingById(id)
 * - GET /api/map/buildings/svg/:svgId   → getBuildingBySvgId(svgId)
 * - GET /api/map/buildings/name/:name   → getBuildingByName(name)
 * - GET /api/map/buildings/zone/:zoneId → getBuildingsByZone(zoneId)
 */

const pool = require('../db');

class BuildingService {
  /**
   * Get all buildings
   * API: GET /api/map/buildings
   * @returns {Array} All buildings ordered by building_id
   */
  async getAllBuildings() {
    try {
      const result = await pool.query(`
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        ORDER BY building_id
      `);
      
      return result.rows;
    } catch (error) {
      console.error('Error fetching all buildings:', error);
      throw error;
    }
  }

  /**
   * Get building by ID
   * API: GET /api/map/buildings/:id
   * @param {number} buildingId - Database building ID
   * @returns {Object|null} Building object or null if not found
   */
  async getBuildingById(buildingId) {
    try {
      const result = await pool.query(`
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        WHERE building_id = $1
      `, [buildingId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching building ${buildingId}:`, error);
      throw error;
    }
  }

  /**
   * Get building by SVG ID
   * API: GET /api/map/buildings/svg/:svgId
   * @param {string} svgId - SVG element ID (e.g., "b11", "b32")
   * @returns {Object|null} Building object or null if not found
   * Note: Multiple buildings can share the same svg_id (e.g., b31)
   */
  async getBuildingBySvgId(svgId) {
    try {
      const result = await pool.query(`
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        WHERE svg_id = $1
      `, [svgId]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching building by SVG ID ${svgId}:`, error);
      throw error;
    }
  }

  /**
   * Get building by name
   * API: GET /api/map/buildings/name/:name
   * @param {string} name - Exact building name
   * @returns {Object|null} Building object or null if not found
   */
  async getBuildingByName(name) {
    try {
      const result = await pool.query(`
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        WHERE building_name = $1
      `, [name]);
      
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error fetching building by name ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get buildings by zone
   * API: GET /api/map/buildings/zone/:zoneId
   * @param {number} zoneId - Zone ID (1-7)
   * @returns {Array} Buildings in the specified zone
   */
  async getBuildingsByZone(zoneId) {
    try {
      const result = await pool.query(`
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        WHERE zone_id = $1
        ORDER BY building_id
      `, [zoneId]);
      
      return result.rows;
    } catch (error) {
      console.error(`Error fetching buildings for zone ${zoneId}:`, error);
      throw error;
    }
  }

  /**
   * Search buildings by query (name, description, exhibits)
   * API: GET /api/map/buildings/search?q=query&zone=1
   * @param {string} query - Search query string
   * @param {Object} options - Search options
   * @param {number} options.zone - Optional zone filter
   * @param {number} options.subzone - Optional subzone filter (not yet implemented)
   * @returns {Array} Matching buildings ordered by name
   */
  async searchBuildings(query, options = {}) {
    try {
      const { zone, subzone } = options;
      let sql = `
        SELECT 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
        FROM map_buildings
        WHERE (
          building_name ILIKE $1 OR
          description ILIKE $1 OR
          exhibits::text ILIKE $1
        )
      `;
      
      const params = [`%${query}%`];
      
      if (zone && zone !== 'all') {
        sql += ` AND zone_id = $2`;
        params.push(zone);
      }
      
      sql += ` ORDER BY building_name`;
      
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error(`Error searching buildings:`, error);
      throw error;
    }
  }

  /**
   * Update building details
   * API: PUT /api/map/buildings/:id
   * @param {number} buildingId - Building ID to update
   * @param {Object} updates - Fields to update
   * @param {string} updates.building_name - New building name
   * @param {string} updates.description - New description
   * @param {number} updates.node_id - New node ID assignment (null to unassign)
   * @param {number} updates.zone_id - New zone ID
   * @param {array} updates.exhibits - New exhibits array
   * @returns {Object} Updated building object
   */
  async updateBuilding(buildingId, updates) {
    try {
      // Build dynamic UPDATE query based on provided fields
      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.building_name !== undefined) {
        fields.push(`building_name = $${paramCount++}`);
        values.push(updates.building_name);
      }
      if (updates.description !== undefined) {
        fields.push(`description = $${paramCount++}`);
        values.push(updates.description);
      }
      if (updates.node_id !== undefined) {
        fields.push(`node_id = $${paramCount++}`);
        values.push(updates.node_id);
      }
      if (updates.zone_id !== undefined) {
        fields.push(`zone_id = $${paramCount++}`);
        values.push(updates.zone_id);
      }
      if (updates.exhibits !== undefined) {
        fields.push(`exhibits = $${paramCount++}`);
        values.push(JSON.stringify(updates.exhibits));
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(buildingId);

      const result = await pool.query(`
        UPDATE map_buildings
        SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE building_id = $${paramCount}
        RETURNING 
          building_id as "building_ID",
          building_name,
          description,
          svg_id,
          node_id,
          zone_id as "zone_ID",
          exhibits,
          coordinates
      `, values);

      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error updating building ${buildingId}:`, error);
      throw error;
    }
  }

  /**
   * Check if a node is already assigned to a building
   * Used to prevent double-assignment of nodes
   * @param {number} nodeId - Node ID to check
   * @param {number} excludeBuildingId - Optional building ID to exclude from check
   * @returns {Object|null} Building using this node, or null if available
   */
  async getBuildingByNodeId(nodeId, excludeBuildingId = null) {
    try {
      let sql = `
        SELECT 
          building_id as "building_ID",
          building_name,
          svg_id,
          node_id
        FROM map_buildings
        WHERE node_id = $1
      `;
      const params = [nodeId];

      if (excludeBuildingId) {
        sql += ` AND building_id != $2`;
        params.push(excludeBuildingId);
      }

      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error(`Error checking node assignment ${nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Get all mappings for quick lookups
   * API: GET /api/map/buildings/mappings
   * @returns {Object} Object containing NAME_TO_SVG, DB_TO_SVG, SVG_TO_NODE, SVG_TO_BUILDING mappings
   * 
   * Response structure:
   * {
   *   NAME_TO_SVG: { "Engineering Faculty": "b11", ... },
   *   DB_TO_SVG: { "1": "b11", "2": "b32", ... },
   *   SVG_TO_NODE: { "b11": 88, "b32": 75, ... },
   *   SVG_TO_BUILDING: { "b11": { building_ID: 1, ... }, ... }
   * }
   */
  async getMappings() {
    try {
      const buildings = await this.getAllBuildings();
      
      return {
        NAME_TO_SVG: buildings.reduce((map, b) => {
          map[b.building_name] = b.svg_id;
          return map;
        }, {}),
        
        DB_TO_SVG: buildings.reduce((map, b) => {
          map[b.building_ID] = b.svg_id;
          return map;
        }, {}),
        
        SVG_TO_NODE: buildings.reduce((map, b) => {
          if (b.svg_id && b.node_id !== null) {
            map[b.svg_id] = b.node_id;
          }
          return map;
        }, {}),
        
        SVG_TO_BUILDING: buildings.reduce((map, b) => {
          if (!map[b.svg_id]) {
            map[b.svg_id] = b;
          }
          return map;
        }, {})
      };
    } catch (error) {
      console.error('Error generating mappings:', error);
      throw error;
    }
  }
}

module.exports = new BuildingService();
