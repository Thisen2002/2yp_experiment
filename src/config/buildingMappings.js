// buildingMappings.js
// SINGLE SOURCE OF TRUTH for all building data and mappings
// All other files should import from this file to ensure consistency

/**
 * Complete building data with all IDs and mappings
 * This is the master list - DO NOT duplicate this data elsewhere!
 */
export const BUILDINGS = [
  {
    building_ID: 1,
    building_name: "Department of Chemical and Process Engineering",
    description: "Department of Chemical and Process Engineering",
    svg_id: "b11",
    node_id: 88,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 2,
    building_name: "Department of Engineering Mathematics / Department of Engineering Management / Computer Center",
    description: "Department of Engineering Mathematics, Department of Engineering Management and Computer Center",
    svg_id: "b32",
    node_id: 75,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 3,
    building_name: "Drawing Office 1",
    description: "Drawing Office 1",
    svg_id: "b33",
    node_id: 87,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 4,
    building_name: "Professor E.O.E. Pereira Theatre",
    description: "Professor E.O.E. Pereira Theatre",
    svg_id: "b16",
    node_id: 81,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 5,
    building_name: "Administrative Building",
    description: "Administrative Building",
    svg_id: "b7",
    node_id: 57,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 6,
    building_name: "Security Unit",
    description: "Security Unit",
    svg_id: "b12",
    node_id: 22,
    zone_ID: 1,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 7,
    building_name: "Electronic Lab",
    description: "Electronic Lab",
    svg_id: "b17",
    node_id: null,
    zone_ID: 2,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 8,
    building_name: "Department of Electrical and Electronic Engineering",
    description: "Department of Electrical and Electronic Engineering",
    svg_id: "b34",
    node_id: 71,
    zone_ID: 2,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 9,
    building_name: "Department of Computer Engineering",
    description: "Department of Computer Engineering",
    svg_id: "b20",
    node_id: 92,
    zone_ID: 2,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 10,
    building_name: "Electrical and Electronic Workshop",
    description: "Electrical and Electronic Workshop",
    svg_id: "b19",
    node_id: null,
    zone_ID: 2,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 11,
    building_name: "Surveying Lab",
    description: "Surveying Lab",
    svg_id: "b31",
    node_id: 61,
    zone_ID: 3,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 12,
    building_name: "Soil Lab",
    description: "Soil Lab",
    svg_id: "b31",
    node_id: 61,
    zone_ID: 3,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 13,
    building_name: "Materials Lab",
    description: "Materials Lab",
    svg_id: "b28",
    node_id: 27,
    zone_ID: 3,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 14,
    building_name: "Environmental Lab",
    description: "Environmental Lab",
    svg_id: "b22",
    node_id: 25,
    zone_ID: 3,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 15,
    building_name: "Fluids Lab",
    description: "Fluids Lab",
    svg_id: "b30",
    node_id: 30,
    zone_ID: 4,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 16,
    building_name: "New Mechanics Lab",
    description: "New Mechanics Lab",
    svg_id: "b24",
    node_id: 48,
    zone_ID: 4,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 17,
    building_name: "Applied Mechanics Lab",
    description: "Applied Mechanics Lab",
    svg_id: "b23",
    node_id: 50,
    zone_ID: 4,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 18,
    building_name: "Thermodynamics Lab",
    description: "Thermodynamics Lab",
    svg_id: "b29",
    node_id: 35,
    zone_ID: 4,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 19,
    building_name: "Engineering Workshop",
    description: "Engineering Workshop",
    svg_id: "b2",
    node_id: 44,
    zone_ID: 5,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 20,
    building_name: "Engineering Carpentry Shop",
    description: "Engineering Carpentry Shop",
    svg_id: "b1",
    node_id: 40,
    zone_ID: 5,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 21,
    building_name: "Drawing Office 2",
    description: "Drawing Office 2",
    svg_id: "b13",
    node_id: 20,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 22,
    building_name: "Drawing Office 2",
    description: "Drawing Office 2",
    svg_id: "b13",
    node_id: 20,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 24,
    building_name: "Lecture Room (bottom-right)",
    description: "Lecture Room (bottom-right)",
    svg_id: "b9",
    node_id: null,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 25,
    building_name: "Structures Laboratory",
    description: "Structures Laboratory",
    svg_id: "b6",
    node_id: 15,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 26,
    building_name: "Engineering Library",
    description: "Engineering Library",
    svg_id: "b10",
    node_id: 29,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 27,
    building_name: "Engineering Library",
    description: "Engineering Library",
    svg_id: "b10",
    node_id: 29,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 28,
    building_name: "Department of Manufacturing and Industrial Engineering",
    description: "Department of Manufacturing and Industrial Engineering",
    svg_id: "b15",
    node_id: 10,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 29,
    building_name: "Faculty Canteen",
    description: "Faculty Canteen",
    svg_id: "b14",
    node_id: 8,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 49,
    building_name: "Building 18A",
    description: "Building 18A",
    svg_id: "b18A",
    node_id: 64,
    zone_ID: 7,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 50,
    building_name: "Engineering Library",
    description: "Engineering Library",
    svg_id: "b10",
    node_id: 29,
    zone_ID: 6,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 51,
    building_name: "Environmental Lab",
    description: "Environmental Lab",
    svg_id: "b22",
    node_id: 25,
    zone_ID: 3,
    exhibits: [],
    coordinates: null
  },
  {
    building_ID: 52,
    building_name: "Building 18",
    description: "Building 18",
    svg_id: "b18",
    node_id: 68,
    zone_ID: 7,
    exhibits: [],
    coordinates: null
  }
];

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
