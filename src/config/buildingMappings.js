// buildingMappings.js
// SINGLE SOURCE OF TRUTH for all building data and mappings
// Imports from shared/buildings.json to ensure consistency between frontend and backend

import buildingsData from '../../shared/buildings.json';

/**
 * Complete building data with all IDs and mappings
 * Imported from shared JSON file - DO NOT duplicate this data!
 */
export const BUILDINGS = buildingsData;

/**
 * Generate mapping objects from the master BUILDINGS array
 * These are computed at runtime to ensure they're always in sync
 */

// Database ID to SVG ID mapping
export const DB_TO_SVG = BUILDINGS.reduce((map, building) => {
  map[building.building_ID] = building.svg_id;
  return map;
}, {});

// Building Name to SVG ID mapping
export const NAME_TO_SVG = BUILDINGS.reduce((map, building) => {
  map[building.building_name] = building.svg_id;
  return map;
}, {});

// SVG ID to Node ID mapping (for routing)
export const SVG_TO_NODE = BUILDINGS.reduce((map, building) => {
  if (building.svg_id && building.node_id !== null) {
    map[building.svg_id] = building.node_id;
  }
  return map;
}, {});

// SVG ID to Building data mapping
export const SVG_TO_BUILDING = BUILDINGS.reduce((map, building) => {
  if (!map[building.svg_id]) {
    map[building.svg_id] = building;
  }
  return map;
}, {});

/**
 * Helper functions
 */

// Get building by database ID
export function getBuildingById(buildingId) {
  return BUILDINGS.find(building => building.building_ID === buildingId);
}

// Get building by SVG ID
export function getBuildingBySvgId(svgId) {
  return BUILDINGS.find(building => building.svg_id === svgId);
}

// Get building by name
export function getBuildingByName(name) {
  return BUILDINGS.find(building => building.building_name === name);
}

// Get all buildings in a zone
export function getBuildingsByZone(zoneId) {
  return BUILDINGS.filter(building => building.zone_ID === zoneId);
}

// Map database ID to SVG ID
export function mapDatabaseIdToSvgId(databaseId) {
  return DB_TO_SVG[databaseId] || null;
}

// Map SVG ID to node ID (for routing)
export function mapSvgIdToNodeId(svgId) {
  return SVG_TO_NODE[svgId] || null;
}

// Map building name to SVG ID
export function mapNameToSvgId(name) {
  return NAME_TO_SVG[name] || null;
}

// Get all buildings
export function getAllBuildings() {
  return [...BUILDINGS];
}

// Search buildings by query
export function searchBuildings(query, { zone } = {}) {
  if (!query || query.trim() === '') return [];
  
  const searchTerm = query.trim().toLowerCase();
  let results = [];
  
  BUILDINGS.forEach((building) => {
    const matchesQuery = 
      building.building_name?.toLowerCase().includes(searchTerm) ||
      building.description?.toLowerCase().includes(searchTerm) ||
      building.exhibits?.some(exhibit => exhibit.toLowerCase().includes(searchTerm));
    
    if (matchesQuery) {
      // Check zone filter if provided
      if (zone && zone !== 'all') {
        if (building.zone_ID !== parseInt(zone)) return;
      }
      
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
        type: 'building',
        nodeId: building.node_id
      });
    }
  });
  
  return results.slice(0, 20);
}

// Export default
export default {
  BUILDINGS,
  DB_TO_SVG,
  NAME_TO_SVG,
  SVG_TO_NODE,
  SVG_TO_BUILDING,
  getBuildingById,
  getBuildingBySvgId,
  getBuildingByName,
  getBuildingsByZone,
  mapDatabaseIdToSvgId,
  mapSvgIdToNodeId,
  mapNameToSvgId,
  getAllBuildings,
  searchBuildings
};
