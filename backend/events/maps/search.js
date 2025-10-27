// search.js
// Enhanced search function with hardcoded building data

// Hardcoded building data - actual engineering faculty buildings
const buildingsData = [
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
function mapDatabaseIdToSvgId(databaseId) {
  const mapping = {
    1: "b11",
    2: "b32",
    3: "b33",   
    4: "b16",
    5: "b7", 
    6: "b12",  
    7: "b17", 
    8: "b34",
    9: "b20",
    10: "b19",
    11: "b31",
    12: "b31",
    13: "b28",
    14: "b22",
    15: "b30",
    16: "b24",
    17: "b23",
    18: "b29",
    19: "b2",
    20: "b1",
    21: "b13",
    22: "b13",
    24: "b9",
    25: "b6",
    26: "b10",
    27: "b10",
    28: "b15",
    29: "b14",
    49: "b18A",
    50: "b10",
    51: "b22",
    52: "b18"
  };
  return mapping[databaseId] || `b${databaseId}`;
}

// Helper function to map SVG ID to node ID
function mapSvgIdToNodeId(svgId) {
  const mapping = {
    "b29": 35,
    "b10": 29,
    "b16": 81,
    "b31": 61,
    "b15": 10,
    "b14": 8,
    "b6": 15,
    "b13": 20,
    "b7": 57,
    "b12": 22,
    "b33": 87,
    "b32": 75,
    "b11": 88,
    "b18": 68,
    "b18A": 64,
    "b20": 92,
    "b21": 56,
    "b28": 27,
    "b22": 25,
    "b30": 30,
    "b23": 50,
    "b24": 48,
    "b4": 50,
    "b2": 44,
    "b1": 40,
    "b34": 71
  };
  return mapping[svgId] || null;
}

export {
  searchDatabase,
  getBuildingById,
  getAllBuildings,
  mapDatabaseIdToSvgId,
  mapSvgIdToNodeId
};

