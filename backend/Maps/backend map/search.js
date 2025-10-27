// search.js
// Enhanced search function with shared building data from JSON file
// SINGLE SOURCE OF TRUTH: shared/buildings.json

const fs = require('fs');
const path = require('path');

// Load building data from shared JSON file
const buildingsDataPath = path.join(__dirname, '../../../shared/buildings.json');
const buildingsData = JSON.parse(fs.readFileSync(buildingsDataPath, 'utf-8'));


// Enhanced search function with improved logic
function searchDatabase(query, { category, zone, subzone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  // Enhanced search logic with improved matching
  buildingsData.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (zone && zone !== 'all') {
        if (building.zone_ID !== parseInt(zone)) return;
      }
      
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
      if (building.exhibits) {
        building.exhibits.forEach((exhibit, index) => {
          if (exhibit.toLowerCase().includes(searchTerm)) {
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
    }
  });
  
  // Remove duplicates and limit results
  const uniqueResults = results.filter((result, index, self) => 
    index === self.findIndex(r => r.id === result.id)
  );
  
  return uniqueResults.slice(0, 20); // Limit to 20 results
}

// Helper function to get building by ID
function getBuildingById(buildingId) {
  return buildingsData.find(building => building.building_ID === buildingId);
}

// Helper function to get all buildings
function getAllBuildings() {
  return buildingsData.map(building => ({
    building_ID: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_ID: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id,
    node_id: building.node_id
  }));
}

// Helper function to map database ID to SVG ID
// Generated dynamically from shared buildings data
function mapDatabaseIdToSvgId(databaseId) {
  const building = buildingsData.find(b => b.building_ID === databaseId);
  return building ? building.svg_id : null;
}

// Helper function to map SVG ID to node ID
// Generated dynamically from shared buildings data
function mapSvgIdToNodeId(svgId) {
  const building = buildingsData.find(b => b.svg_id === svgId);
  return building ? building.node_id : null;
}

module.exports = searchDatabase;
module.exports.getBuildingById = getBuildingById;
module.exports.getAllBuildings = getAllBuildings;
module.exports.mapDatabaseIdToSvgId = mapDatabaseIdToSvgId;
module.exports.mapSvgIdToNodeId = mapSvgIdToNodeId;

