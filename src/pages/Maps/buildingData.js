// buildingData.js
// Sample building data for testing the interactive exhibition map
// This replaces the backend service when it's not available
// NOW IMPORTS FROM CENTRAL CONFIG - DO NOT DUPLICATE DATA HERE!

import buildingApiService from "./buildingApi";
import buildingMappings from "../../config/buildingMappings";

const other_buildings = [
  {
    building_id: 50,
    zone_ID: 6,
    building_name: "Engineering Library",
    description: "Engineering Library"
  },
  {
    building_id: 51,
    zone_ID: 3,
    building_name: "Environmental Lab",
    description: "Environmental Lab"
  },
  {
    building_id: 52,
    zone_ID: 7,
    building_name: "Building 18",
    description: "Building 18"
  },
  {
    building_id: 49,
    zone_ID: 7,
    building_name: "Building 18A",
    description: "Building 18A"
  }
]

// Import building data from central config
const buildingData = buildingMappings.BUILDINGS.map(b => ({
  building_ID: b.building_ID,
  zone_ID: b.zone_ID,
  building_name: b.building_name,
  description: b.description,
  exhibits: b.exhibits || [],
  coordinates: b.coordinates,
  svg_id: b.svg_id
}));

// Zone information (matches database schema)
const zoneData = [
  {
    zone_ID: 1,
    zone_name: "A"
  },
  {
    zone_ID: 2,
    zone_name: "B"
  },
  {
    zone_ID: 3,
    zone_name: "C"
  },
  {
    zone_ID: 4,
    zone_name: "D"
  }
];

// Helper functions - now using central config
const getBuildingById = (id) => {
  return buildingMappings.getBuildingById(id);
};

const getBuildingsByZone = (zoneId) => {
  return buildingMappings.getBuildingsByZone(zoneId);
};

const searchBuildings = (query, options = {}) => {
  return buildingMappings.searchBuildings(query, options);
};

const getAllBuildings = () => {
  return buildingMappings.getAllBuildings().map(building => ({
    building_id: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_id: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id
  }));
};

// Export the data and functions
export {
  buildingData,
  zoneData,
  other_buildings,
  getBuildingById,
  getBuildingsByZone,
  searchBuildings,
  getAllBuildings
};

export default buildingData;