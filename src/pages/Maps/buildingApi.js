// Building API service for connecting to the building service
// This service handles all communication with the building service backend
// Falls back to sample data when backend is not available

import { 
  getAllBuildings as getAllBuildingsFromAPI,
  getBuildingById as getBuildingByIdFromAPI,
  searchBuildings as searchBuildingsFromAPI,
  mapDatabaseIdToSvgId as mapIdToSvg
} from '../../config/buildingMappings.js';

const BUILDING_SERVICE_URL = 'http://localhost:5000'; // Building service port (legacy)
const USE_SAMPLE_DATA = true; // Set to true to use database API instead of legacy backend

class BuildingApiService {
  // let preFetchBuildings = [];
  constructor() {
    this.baseUrl = BUILDING_SERVICE_URL;
    this.preFetchBuildings = [];
    this.preFetch()
    .then((data) => {
      this.preFetchBuildings = data;
    }).catch((data) => this.preFetchBuildings = data)
    .finally(() => {
      console.log("at constructor buildingApi")
      console.log(this.preFetchBuildings)
    })
    
  }

  async preFetch(){
    try {
      // Use the new database API
      const data = await getAllBuildingsFromAPI();
      console.log(`fetched data from database:`, data);
      return data.map(b => ({
        building_id: b.building_ID,
        building_name: b.building_name,
        description: b.description,
        zone_id: b.zone_ID,
        exhibits: b.exhibits || [],
        coordinates: b.coordinates,
        svg_id: b.svg_id
      }));
    } catch (error) {
      console.error('Error fetching buildings from database:', error);
      return [];
    }
  }

  // Get all buildings
  async getAllBuildings() {
    if (USE_SAMPLE_DATA) {
      console.log('Using database API for building data');
      const buildings = await getAllBuildingsFromAPI();
      return buildings.map(b => ({
        building_id: b.building_ID,
        building_name: b.building_name,
        description: b.description,
        zone_id: b.zone_ID,
        exhibits: b.exhibits || [],
        coordinates: b.coordinates,
        svg_id: b.svg_id
      }));
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/buildings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`fetched data:${data}`)
      return data;
    } catch (error) {
      console.error('Error fetching buildings, falling back to sample data:', error);
      return getAllSampleBuildings();
    }
  }

  // Get building by ID
  async getBuildingById(buildingId) {
    if (USE_SAMPLE_DATA) {
      console.log('Using database API for building ID:', buildingId);
      const building = await getBuildingByIdFromAPI(buildingId);
      if (!building) return null;
      return {
        building_id: building.building_ID,
        building_name: building.building_name,
        description: building.description,
        zone_id: building.zone_ID,
        exhibits: building.exhibits || [],
        coordinates: building.coordinates,
        svg_id: building.svg_id
      };
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/buildings/${buildingId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching building by ID, falling back to database API:', error);
      const building = await getBuildingByIdFromAPI(buildingId);
      if (!building) return null;
      return {
        building_id: building.building_ID,
        building_name: building.building_name,
        description: building.description,
        zone_id: building.zone_ID,
        exhibits: building.exhibits || [],
        coordinates: building.coordinates,
        svg_id: building.svg_id
      };
    }
  }

  // Create new building
  async createBuilding(buildingData) {
    try {
      const response = await fetch(`${this.baseUrl}/buildings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating building:', error);
      throw error;
    }
  }

  // Update building
  async updateBuilding(buildingId, buildingData) {
    try {
      const response = await fetch(`${this.baseUrl}/buildings/${buildingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildingData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating building:', error);
      throw error;
    }
  }

  // Delete building
  async deleteBuilding(buildingId) {
    try {
      const response = await fetch(`${this.baseUrl}/buildings/${buildingId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting building:', error);
      throw error;
    }
  }

  // Search buildings by name or description
  async searchBuildings(query) {
    try {
      const allBuildings =  this.preFetchBuildings;
      const filteredBuildings = allBuildings.filter(building => 
        building.building_name.toLowerCase().includes(query.toLowerCase()) ||
        (building.description && building.description.toLowerCase().includes(query.toLowerCase()))
      );
      return filteredBuildings;
    } catch (error) {
      console.error('Error searching buildings:', error);
      throw error;
    }
  }

  // Get buildings by zone
  async getBuildingsByZone(zoneId) {
    try {
      const allBuildings = await this.getAllBuildings();
      const zoneBuildings = allBuildings.filter(building => 
        building.zone_id === parseInt(zoneId)
      );
      return zoneBuildings;
    } catch (error) {
      console.error('Error fetching buildings by zone:', error);
      throw error;
    }
  }

  // Transform building data for map display
  transformBuildingForMap(building) {
    return {
      id: building.building_id,
      name: building.building_name,
      description: building.description,
      zoneId: building.zone_id,
      exhibits: building.exhibits || [],
      // Add coordinates mapping if you have building coordinates
      // You might need to map building_id to actual map coordinates
      coordinates: this.getBuildingCoordinates(building.building_id),
      type: 'building',
      category: 'Building'
    };
  }

  // Map building IDs to coordinates (you'll need to customize this based on your map)
  getBuildingCoordinates(buildingId) {
    // This is a mapping function - you'll need to customize this based on your actual building positions
    const buildingCoordinates = {
      1: [7.253750, 80.592028], // Example coordinates
      2: [7.253800, 80.592100],
      3: [7.253850, 80.592150],
      // Add more mappings as needed
    };
    return buildingCoordinates[buildingId] || [7.253750, 80.592028]; // Default coordinates
  }

  // Search buildings by name, description, and exhibits
  async searchBuildings(query, options = {}) {    
    try {
      if (!query || query.trim() === '') return [];
      
      // Use the new database search API
      const results = await searchBuildingsFromAPI(query, options);
      
      return results.slice(0, 10); // Limit to 10 results for better UX
      
    } catch (error) {
      console.error('Error searching buildings:', error);
      return [];
    }
  }

  // Map database building ID to SVG building ID (b33, b34, etc.)
  async mapDatabaseIdToSvgId(databaseId) {
    return await mapIdToSvg(databaseId);
  }

  // Check if a building has a valid SVG mapping (exists on the map)
  async isValidSvgMapping(databaseId) {
    const svgId = await mapIdToSvg(databaseId);
    return svgId !== null;
  }
}

// Create and export a singleton instance
const buildingApiService = new BuildingApiService();
export default buildingApiService;
