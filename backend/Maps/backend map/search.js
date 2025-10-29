// search.js
// Enhanced search function with database building data
// SINGLE SOURCE OF TRUTH: map_buildings database table
//
// ========================================
// DATABASE MIGRATION NOTES:
// ========================================
// Previously: Read from shared/buildings.json file using fs.readFileSync
// Now: Fetches from PostgreSQL map_buildings table via buildingService
// 
// Used by API endpoint: GET /api/search?query=...&zone=1
// All functions are async to support database queries
// ========================================

const buildingService = require('./services/buildingService');

/**
 * Enhanced search function with improved logic
 * Used by: GET /api/search endpoint in app.js
 * @param {string} query - Search query string
 * @param {Object} options - Search options
 * @param {string} options.category - Category filter (not yet implemented)
 * @param {number} options.zone - Zone filter (1-7 or 'all')
 * @param {number} options.subzone - Subzone filter (not yet implemented)
 * @returns {Array} Search results with buildings and exhibits (max 20)
 */
async function searchDatabase(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim();
  let results = [];
  
  // Use buildingService to search the database
  const buildings = await buildingService.searchBuildings(searchTerm, { zone });
  
  // Transform buildings data to match expected result format
  buildings.forEach((building) => {
    // Add building to results
    results.push({
      id: building.building_ID,
      name: building.building_name,
      category: 'Building',
      description: building.description,
      buildingId: building.building_ID,
      buildingName: building.building_name,
      svgBuildingId: building.svg_id,
      zoneId: building.zone_ID,
      coordinates: building.coordinates,
      exhibits: building.exhibits || [],
      type: 'building'
    });
    
    // Add exhibits from this building that match the search
    if (building.exhibits && Array.isArray(building.exhibits)) {
      building.exhibits.forEach((exhibit, index) => {
        if (exhibit.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            id: `${building.building_ID}-exhibit-${index}`,
            name: exhibit,
            category: 'Exhibits',
            description: `Exhibit in ${building.building_name}`,
            buildingId: building.building_ID,
            buildingName: building.building_name,
            svgBuildingId: building.svg_id,
            zoneId: building.zone_ID,
            coordinates: building.coordinates,
            type: 'exhibit'
          });
        }
      });
    }
  });
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  return uniqueResults.slice(0, 20); // Limit to 20 results
}

/**
 * Helper function to get building by ID
 * @param {number} buildingId - Database building ID
 * @returns {Promise<Object|null>} Building object or null
 */
async function getBuildingById(buildingId) {
  return await buildingService.getBuildingById(buildingId);
}

/**
 * Helper function to get all buildings
 * @returns {Promise<Array>} All 28 buildings from database
 */
async function getAllBuildings() {
  return await buildingService.getAllBuildings();
}

/**
 * Helper function to map database ID to SVG ID
 * @param {number} databaseId - Building database ID
 * @returns {Promise<string|null>} SVG element ID or null
 */
async function mapDatabaseIdToSvgId(databaseId) {
  const building = await buildingService.getBuildingById(databaseId);
  return building ? building.svg_id : null;
}

/**
 * Helper function to map SVG ID to node ID
 * @param {string} svgId - SVG element ID
 * @returns {Promise<number|null>} Navigation node ID or null
 */
async function mapSvgIdToNodeId(svgId) {
  const building = await buildingService.getBuildingBySvgId(svgId);
  return building ? building.node_id : null;
}

// Export main search function and helpers
module.exports = searchDatabase;
module.exports.getBuildingById = getBuildingById;
module.exports.getAllBuildings = getAllBuildings;
module.exports.mapDatabaseIdToSvgId = mapDatabaseIdToSvgId;
module.exports.mapSvgIdToNodeId = mapSvgIdToNodeId;

