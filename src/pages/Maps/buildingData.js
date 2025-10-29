// buildingData.js
// Sample building data for testing the interactive exhibition map
// NOW IMPORTS FROM CENTRAL CONFIG - DO NOT DUPLICATE DATA HERE!

import { 
  getAllBuildings as fetchAllBuildings,
  getBuildingById as fetchBuildingById,
  getBuildingsByZone as fetchBuildingsByZone,
  searchBuildings as fetchSearchBuildings
} from "../../config/buildingMappings";

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

// Helper functions - now async to support database fetching
const getBuildingById = async (id) => {
  return await fetchBuildingById(id);
};

const getBuildingsByZone = async (zoneId) => {
  return await fetchBuildingsByZone(zoneId);
};

const searchBuildings = async (query, options = {}) => {
  return await fetchSearchBuildings(query, options);
};

const getAllBuildings = async () => {
  const buildings = await fetchAllBuildings();
  return buildings.map(building => ({
    building_id: building.building_ID,
    building_name: building.building_name,
    description: building.description,
    zone_id: building.zone_ID,
    exhibits: building.exhibits || [],
    coordinates: building.coordinates,
    svg_id: building.svg_id
  }));
};

// Async function to get building data array
const getBuildingData = async () => {
  const buildings = await fetchAllBuildings();
  return buildings.map(b => ({
    building_ID: b.building_ID,
    zone_ID: b.zone_ID,
    building_name: b.building_name,
    description: b.description,
    exhibits: b.exhibits || [],
    coordinates: b.coordinates,
    svg_id: b.svg_id
  }));
};

// Export the data and functions
export {
  getBuildingData,
  zoneData,
  getBuildingById,
  getBuildingsByZone,
  searchBuildings,
  getAllBuildings
};

// For components expecting default export, provide async getter
export default getBuildingData;