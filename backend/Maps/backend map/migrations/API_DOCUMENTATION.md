# Building API Documentation

## Overview
This API provides access to building data stored in the PostgreSQL `map_buildings` table. All building data was migrated from `shared/buildings.json` to the database for better scalability and CRUD operations.

**Base URL:** `http://localhost:3001/api/map`

---

## Database Schema

**Table:** `map_buildings`

| Column | Type | Description |
|--------|------|-------------|
| building_id | INTEGER (PK) | Unique building identifier (1-52, with gaps) |
| building_name | TEXT | Building name (e.g., "Engineering Faculty") |
| description | TEXT | Building description |
| svg_id | TEXT | SVG element ID for map highlighting (e.g., "b11", "b32") |
| node_id | INTEGER (FK) | Navigation node ID for routing (can be null) |
| zone_id | INTEGER | Zone identifier for grouping buildings (1-7) |
| exhibits | JSONB | Array of exhibits in this building |
| coordinates | JSONB | Geographic coordinates [lat, lng] |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp (auto-updated) |

**Notes:**
- Some buildings share the same `svg_id` (e.g., buildings 11 & 12 both use "b31")
- `node_id` references `navigation_nodes(node_index)` with ON DELETE SET NULL
- Total buildings: 28 (IDs: 1-6, 8-21, 24-26, 28-29, 49, 52)

---

## API Endpoints

### 1. Get All Buildings
```http
GET /api/map/buildings
```

**Description:** Retrieves all 28 buildings from the database.

**Response:**
```json
[
  {
    "building_ID": 1,
    "building_name": "Department of Chemical and Process Engineering",
    "description": "Department of Chemical and Process Engineering",
    "svg_id": "b11",
    "node_id": 88,
    "zone_ID": 1,
    "exhibits": [],
    "coordinates": null
  },
  ...
]
```

**Used By:**
- Frontend: `buildingMappings.js` → `fetchBuildings()`
- Service: `buildingService.getAllBuildings()`

---

### 2. Get Building Mappings
```http
GET /api/map/buildings/mappings
```

**Description:** Returns all mapping objects for quick lookups.

**Response:**
```json
{
  "NAME_TO_SVG": {
    "Engineering Faculty": "b11",
    "Administrative Building": "b7",
    ...
  },
  "DB_TO_SVG": {
    "1": "b11",
    "2": "b32",
    ...
  },
  "SVG_TO_NODE": {
    "b11": 88,
    "b32": 75,
    ...
  },
  "SVG_TO_BUILDING": {
    "b11": { "building_ID": 1, ... },
    "b32": { "building_ID": 2, ... },
    ...
  }
}
```

**Used By:**
- Frontend: `buildingMappings.js` → `fetchMappings()`
- Frontend: Cached for 5 minutes to reduce API calls
- Service: `buildingService.getMappings()`

---

### 3. Search Buildings
```http
GET /api/map/buildings/search?q={query}&zone={zoneId}
```

**Query Parameters:**
- `q` (string, required): Search query string
- `zone` (integer, optional): Zone filter (1-7 or 'all')

**Description:** Searches buildings by name, description, or exhibits.

**Example:**
```http
GET /api/map/buildings/search?q=computer
GET /api/map/buildings/search?q=lab&zone=3
```

**Response:**
```json
[
  {
    "building_ID": 9,
    "building_name": "Department of Computer Engineering",
    "description": "Department of Computer Engineering",
    "svg_id": "b20",
    "node_id": 92,
    "zone_ID": 2,
    "exhibits": [],
    "coordinates": null
  }
]
```

**Used By:**
- Frontend: `buildingMappings.js` → `searchBuildings(query, options)`
- Service: `buildingService.searchBuildings(query, options)`

**⚠️ Important:** This route MUST be defined before `/:id` route in Express to avoid conflicts.

---

### 4. Get Building by ID
```http
GET /api/map/buildings/:id
```

**Path Parameters:**
- `id` (integer): Building database ID (1-52)

**Description:** Retrieves a single building by its database ID.

**Example:**
```http
GET /api/map/buildings/1
```

**Response:**
```json
{
  "building_ID": 1,
  "building_name": "Department of Chemical and Process Engineering",
  "description": "Department of Chemical and Process Engineering",
  "svg_id": "b11",
  "node_id": 88,
  "zone_ID": 1,
  "exhibits": [],
  "coordinates": null
}
```

**Error Responses:**
- `400 Bad Request`: Invalid building ID (not a number)
- `404 Not Found`: Building not found

**Used By:**
- Service: `buildingService.getBuildingById(id)`
- Backend: `search.js` → `getBuildingById()`

---

### 5. Get Building by SVG ID
```http
GET /api/map/buildings/svg/:svgId
```

**Path Parameters:**
- `svgId` (string): SVG element ID (e.g., "b11", "b32")

**Description:** Retrieves a building by its SVG element ID. Returns first match if multiple buildings share the same svg_id.

**Example:**
```http
GET /api/map/buildings/svg/b11
```

**Response:**
```json
{
  "building_ID": 1,
  "building_name": "Department of Chemical and Process Engineering",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Building not found

**Used By:**
- Frontend: `buildingMappings.js` → `getBuildingBySvgId()`
- Service: `buildingService.getBuildingBySvgId(svgId)`

**Note:** Buildings 11 and 12 both have `svg_id = "b31"`. This endpoint returns the first match (building 11).

---

### 6. Get Building by Name
```http
GET /api/map/buildings/name/:name
```

**Path Parameters:**
- `name` (string): Exact building name (URL-encoded if contains spaces)

**Description:** Retrieves a building by its exact name.

**Example:**
```http
GET /api/map/buildings/name/Engineering%20Library
```

**Response:**
```json
{
  "building_ID": 26,
  "building_name": "Engineering Library",
  ...
}
```

**Error Responses:**
- `404 Not Found`: Building not found

**Used By:**
- Frontend: `buildingMappings.js` → `getBuildingByName()`
- Service: `buildingService.getBuildingByName(name)`

---

### 7. Get Buildings by Zone
```http
GET /api/map/buildings/zone/:zoneId
```

**Path Parameters:**
- `zoneId` (integer): Zone ID (1-7)

**Description:** Retrieves all buildings in a specific zone.

**Example:**
```http
GET /api/map/buildings/zone/1
```

**Response:**
```json
[
  {
    "building_ID": 1,
    "building_name": "Department of Chemical and Process Engineering",
    "zone_ID": 1,
    ...
  },
  {
    "building_ID": 2,
    "building_name": "Department of Engineering Mathematics / ...",
    "zone_ID": 1,
    ...
  }
]
```

**Error Responses:**
- `400 Bad Request`: Invalid zone ID (not a number)

**Used By:**
- Frontend: `buildingMappings.js` → `getBuildingsByZone()`
- Service: `buildingService.getBuildingsByZone(zoneId)`

---

## Legacy Endpoints

### Search Endpoint (Legacy)
```http
GET /api/search?query={query}&zone={zone}
```

**Description:** Legacy search endpoint that wraps the building search functionality.

**Used By:**
- Backend: `search.js` → `searchDatabase()`
- Frontend: Various search components

**Note:** This endpoint now uses the database via `buildingService` instead of reading `buildings.json`.

---

## Frontend Integration

### Initialization
All frontend code should initialize building data on app startup:

```javascript
import { initializeBuildingData } from './config/buildingMappings';

// In App.tsx or main component
useEffect(() => {
  initializeBuildingData().then(success => {
    if (success) {
      console.log('Building data initialized');
    }
  });
}, []);
```

### Caching Strategy
- **Duration:** 5 minutes
- **Storage:** In-memory (buildingsCache, mappingsCache)
- **Auto-refresh:** Checks cache age on each request

### Using the API

```javascript
import {
  getAllBuildings,
  getBuildingById,
  getBuildingBySvgId,
  searchBuildings,
  mapSvgIdToNodeId
} from './config/buildingMappings';

// All functions are async
const buildings = await getAllBuildings();
const building = await getBuildingById(1);
const results = await searchBuildings('computer', { zone: 2 });
const nodeId = await mapSvgIdToNodeId('b11'); // Returns 88
```

---

## Migration Notes

### What Changed?
- **Before:** `shared/buildings.json` → Imported at build time
- **After:** PostgreSQL `map_buildings` table → Fetched via API at runtime

### Files Modified
1. **Backend:**
   - `services/buildingService.js` (NEW) - Database service layer
   - `search.js` - Now async, uses buildingService
   - `app.js` - Added 7 new API endpoints
   - `db.js` - Database connection configuration

2. **Frontend:**
   - `config/buildingMappings.js` - Fetch from API instead of JSON import
   - `App.tsx` - Initialize building data on startup

3. **Database:**
   - `migrations/create_map_buildings_table.sql` - Table schema
   - `migrations/migrate_buildings_data.js` - Data import script

### Migration Steps
```bash
# 1. Create table
psql -U postgres -d engx -f backend/Maps/backend\ map/migrations/create_map_buildings_table.sql

# 2. Import data
cd backend/Maps/backend\ map/migrations
node migrate_buildings_data.js

# 3. Verify
psql -U postgres -d engx -c "SELECT COUNT(*) FROM map_buildings;"
# Should return: 28
```

---

## Zone Distribution

| Zone ID | Building Count | Examples |
|---------|---------------|----------|
| 1 | 6 | Engineering Faculty, Admin Building |
| 2 | 4 | Electrical Dept, Computer Dept |
| 3 | 3 | Surveying Lab, Soil Lab, Materials Lab |
| 4 | 4 | Fluids Lab, Mechanics Labs |
| 5 | 2 | Workshop, Carpentry Shop |
| 6 | 6 | Library, Lecture Rooms |
| 7 | 2 | Building 18, Building 18A |

**Total:** 28 buildings across 7 zones

---

## Error Handling

All endpoints implement consistent error handling:

```javascript
try {
  const result = await buildingService.someMethod();
  res.json(result);
} catch (error) {
  console.error('Error description:', error);
  res.status(500).json({ error: 'User-friendly error message' });
}
```

**Standard HTTP Status Codes:**
- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Database or server error

---

## Performance Considerations

1. **Indexes:** Created on `svg_id`, `node_id`, `zone_id`, `building_name` for fast queries
2. **Caching:** Frontend caches for 5 minutes to reduce database load
3. **Connection Pooling:** Max 20 concurrent database connections
4. **Query Optimization:** All queries use indexed columns in WHERE clauses

---

## Testing

```bash
# Test all buildings endpoint
curl http://localhost:3001/api/map/buildings

# Test mappings endpoint
curl http://localhost:3001/api/map/buildings/mappings

# Test search
curl "http://localhost:3001/api/map/buildings/search?q=computer"

# Test by ID
curl http://localhost:3001/api/map/buildings/1

# Test by SVG ID
curl http://localhost:3001/api/map/buildings/svg/b11

# Test by zone
curl http://localhost:3001/api/map/buildings/zone/1
```

---

## Future Enhancements

- [ ] Add POST/PUT/DELETE endpoints for CRUD operations
- [ ] Add authentication/authorization
- [ ] Implement subzone filtering in search
- [ ] Add building images/photos
- [ ] Add opening hours data
- [ ] Implement GraphQL API
- [ ] Add WebSocket support for real-time updates

---

**Last Updated:** October 29, 2025  
**Database:** PostgreSQL (engx)  
**Total Buildings:** 28  
**API Version:** 1.0
