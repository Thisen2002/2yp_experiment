// buildingMappings.js
// SINGLE SOURCE OF TRUTH for all building data and mappings
// Fetches from database via API to ensure consistency between frontend and backend
//
// ========================================
// API ENDPOINTS USED BY THIS MODULE:
// ========================================
// - GET /api/map/buildings              → Fetch all 28 buildings
// - GET /api/map/buildings/mappings     → Fetch NAME_TO_SVG, DB_TO_SVG, SVG_TO_NODE, SVG_TO_BUILDING
// - GET /api/map/buildings/search?q=... → Search buildings by query
// - GET /api/map/buildings/svg/:svgId   → Fetch building by SVG ID
// - GET /api/map/buildings/name/:name   → Fetch building by name
// - GET /api/map/buildings/zone/:zoneId → Fetch buildings by zone
//
// All data is cached in memory for 5 minutes to reduce API calls
// Call initializeBuildingData() on app startup to populate cache
// ========================================

/* NodeVisualizer:

- View all navigation nodes (colored by connectivity status)
- Add new nodes at precise GPS coordinates
- Create edges (connections) between nodes
- Remove edges between nodes
- Delete nodes from the graph
- Edit/move existing nodes to new positions

---*/

const API_BASE_URL = 'http://localhost:3001/api/map';

// In-memory cache for building data and mappings
let buildingsCache = null;
let mappingsCache = null;
let lastFetchTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch all buildings from the database
 * API: GET /api/map/buildings
 * @returns {Array} All 28 buildings from map_buildings table
 */
async function fetchBuildings() {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const buildings = await response.json();
    buildingsCache = buildings;
    lastFetchTime = Date.now();
    return buildings;
  } catch (error) {
    console.error('Error fetching buildings:', error);
    throw error;
  }
}

/**
 * Fetch all mappings from the database
 * API: GET /api/map/buildings/mappings
 * @returns {Object} { NAME_TO_SVG, DB_TO_SVG, SVG_TO_NODE, SVG_TO_BUILDING }
 */
async function fetchMappings() {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/mappings`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const mappings = await response.json();
    mappingsCache = mappings;
    return mappings;
  } catch (error) {
    console.error('Error fetching mappings:', error);
    throw error;
  }
}

/**
 * Get buildings with caching
 */
async function getBuildings(forceRefresh = false) {
  const cacheExpired = !lastFetchTime || (Date.now() - lastFetchTime > CACHE_DURATION);
  
  if (forceRefresh || !buildingsCache || cacheExpired) {
    await fetchBuildings();
  }
  
  return buildingsCache;
}

/**
 * Get mappings with caching
 */
async function getMappings(forceRefresh = false) {
  const cacheExpired = !lastFetchTime || (Date.now() - lastFetchTime > CACHE_DURATION);
  
  if (forceRefresh || !mappingsCache || cacheExpired) {
    await fetchMappings();
  }
  
  return mappingsCache;
}

/**
 * Synchronously get cached buildings (throws if not loaded)
 */
export function getBUILDINGS() {
  if (!buildingsCache) {
    throw new Error('Buildings not loaded. Call initializeBuildingData() first.');
  }
  return buildingsCache;
}

/**
 * Synchronously get cached mappings (throws if not loaded)
 */
export function getDB_TO_SVG() {
  if (!mappingsCache) {
    throw new Error('Mappings not loaded. Call initializeBuildingData() first.');
  }
  return mappingsCache.DB_TO_SVG;
}

export function getNAME_TO_SVG() {
  if (!mappingsCache) {
    throw new Error('Mappings not loaded. Call initializeBuildingData() first.');
  }
  return mappingsCache.NAME_TO_SVG;
}

export function getSVG_TO_NODE() {
  if (!mappingsCache) {
    throw new Error('Mappings not loaded. Call initializeBuildingData() first.');
  }
  return mappingsCache.SVG_TO_NODE;
}

export function getSVG_TO_BUILDING() {
  if (!mappingsCache) {
    throw new Error('Mappings not loaded. Call initializeBuildingData() first.');
  }
  return mappingsCache.SVG_TO_BUILDING;
}

/**
 * Initialize building data - call this on app startup
 * Fetches both buildings and mappings in parallel
 * Used in: App.tsx useEffect hook
 * @returns {Promise<boolean>} true if successful, false if failed
 */
export async function initializeBuildingData() {
  try {
    await Promise.all([
      getBuildings(),
      getMappings()
    ]);
    return true;
  } catch (error) {
    console.error('Failed to initialize building data:', error);
    return false;
  }
}

/**
 * ========================================
 * HELPER FUNCTIONS - All async
 * ========================================
 */

/**
 * Get building by database ID
 * @param {number} buildingId - Building ID (1-52)
 * @returns {Promise<Object|null>} Building object or null
 */
export async function getBuildingById(buildingId) {
  const buildings = await getBuildings();
  return buildings.find(building => building.building_ID === buildingId);
}

/**
 * Get building by SVG ID
 * API: GET /api/map/buildings/svg/:svgId
 * @param {string} svgId - SVG element ID (e.g., "b11", "b31")
 * @returns {Promise<Object|null>} First building with matching svg_id
 * Note: Some buildings share svg_id (e.g., buildings 11 & 12 both use "b31")
 */
export async function getBuildingBySvgId(svgId) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/svg/${encodeURIComponent(svgId)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching building by SVG ID:', error);
    return null;
  }
}

/**
 * Get building by name
 * API: GET /api/map/buildings/name/:name
 * @param {string} name - Exact building name
 * @returns {Promise<Object|null>} Building object or null
 */
export async function getBuildingByName(name) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/name/${encodeURIComponent(name)}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching building by name:', error);
    return null;
  }
}

/**
 * Get all buildings in a zone
 * API: GET /api/map/buildings/zone/:zoneId
 * @param {number} zoneId - Zone ID (1-7)
 * @returns {Promise<Array>} Array of buildings in the zone
 */
export async function getBuildingsByZone(zoneId) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/zone/${zoneId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching buildings by zone:', error);
    return [];
  }
}

/**
 * Map database ID to SVG ID
 * Uses cached mappings for performance
 * @param {number} databaseId - Building database ID
 * @returns {Promise<string|null>} SVG ID or null
 */
export async function mapDatabaseIdToSvgId(databaseId) {
  const mappings = await getMappings();
  return mappings.DB_TO_SVG[databaseId] || null;
}

/**
 * Map SVG ID to node ID (for routing)
 * Uses cached mappings for performance
 * @param {string} svgId - SVG element ID
 * @returns {Promise<number|null>} Navigation node ID or null
 */
export async function mapSvgIdToNodeId(svgId) {
  const mappings = await getMappings();
  return mappings.SVG_TO_NODE[svgId] || null;
}

/**
 * Map building name to SVG ID
 * Uses cached mappings for performance
 * @param {string} name - Building name
 * @returns {Promise<string|null>} SVG ID or null
 */
export async function mapNameToSvgId(name) {
  const mappings = await getMappings();
  return mappings.NAME_TO_SVG[name] || null;
}

/**
 * Get all buildings from cache
 * @returns {Promise<Array>} All 28 buildings
 */
export async function getAllBuildings() {
  return await getBuildings();
}

/**
 * Search buildings by query
 * API: GET /api/map/buildings/search?q=query&zone=1
 * @param {string} query - Search query string
 * @param {Object} options - Search options
 * @param {number} options.zone - Optional zone filter (1-7 or 'all')
 * @returns {Promise<Array>} Array of matching buildings (max 20)
 */
export async function searchBuildings(query, { zone } = {}) {
  try {
    const params = new URLSearchParams({ q: query });
    if (zone && zone !== 'all') {
      params.append('zone', zone);
    }
    
    const response = await fetch(`${API_BASE_URL}/buildings/search?${params}`);
    if (!response.ok) return [];
    
    const buildings = await response.json();
    
    // Transform to match expected format
    return buildings.map(building => ({
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
    })).slice(0, 20);
  } catch (error) {
    console.error('Error searching buildings:', error);
    return [];
  }
}

/**
 * Backward compatibility: Export objects that work with cached data
 * These Proxies provide synchronous access to cached data after initialization
 * If accessed before initialization, they return empty objects/arrays with a warning
 */
export const BUILDINGS = new Proxy([], {
  get(target, prop) {
    if (!buildingsCache) {
      console.warn('Buildings not loaded yet. Returning empty array. Call initializeBuildingData() first.');
      return [];
    }
    if (prop === 'length') return buildingsCache.length;
    if (prop === 'map' || prop === 'filter' || prop === 'find' || prop === 'forEach' || prop === 'some' || prop === 'every') {
      return buildingsCache[prop].bind(buildingsCache);
    }
    if (typeof prop === 'number' || !isNaN(prop)) {
      return buildingsCache[prop];
    }
    return buildingsCache[prop];
  }
});

export const DB_TO_SVG = new Proxy({}, {
  get(target, prop) {
    if (!mappingsCache) {
      console.warn('Mappings not loaded yet. Returning null. Call initializeBuildingData() first.');
      return null;
    }
    return mappingsCache.DB_TO_SVG[prop];
  }
});

export const NAME_TO_SVG = new Proxy({}, {
  get(target, prop) {
    if (!mappingsCache) {
      console.warn('Mappings not loaded yet. Returning null. Call initializeBuildingData() first.');
      return null;
    }
    return mappingsCache.NAME_TO_SVG[prop];
  }
});

export const SVG_TO_NODE = new Proxy({}, {
  get(target, prop) {
    if (!mappingsCache) {
      console.warn('Mappings not loaded yet. Returning null. Call initializeBuildingData() first.');
      return null;
    }
    return mappingsCache.SVG_TO_NODE[prop];
  }
});

export const SVG_TO_BUILDING = new Proxy({}, {
  get(target, prop) {
    if (!mappingsCache) {
      console.warn('Mappings not loaded yet. Returning null. Call initializeBuildingData() first.');
      return null;
    }
    return mappingsCache.SVG_TO_BUILDING[prop];
  }
});

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
  searchBuildings,
  initializeBuildingData,
  getBUILDINGS,
  getDB_TO_SVG,
  getNAME_TO_SVG,
  getSVG_TO_NODE,
  getSVG_TO_BUILDING
};
