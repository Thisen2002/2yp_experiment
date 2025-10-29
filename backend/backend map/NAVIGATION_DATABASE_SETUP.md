# Navigation Graph Database Setup Guide

## Overview

This guide explains how the navigation system has been migrated from hardcoded `path.json` to PostgreSQL database with **automatic fallback support**.

### 🎯 Key Features

- ✅ **Primary Source**: PostgreSQL database via REST API
- ✅ **Automatic Fallback**: Uses `path.json` if database is unavailable
- ✅ **Smart Caching**: Minimizes repeated database queries
- ✅ **Seamless Operation**: Works whether database is connected or not
- ✅ **Real-time Updates**: Changes to database reflect immediately (after cache refresh)

### 📁 Updated Files

1. **`routing.js`** - Now fetches from database with fallback to path.json
2. **`app.js`** - Socket.io handler updated for async routing
3. **`NodeVisualizer.jsx`** - Frontend fetches from API with fallback
4. **`db.js`** - PostgreSQL connection pool (to be configured)

## 📋 Database Structure

### Tables Created:

1. **`navigation_nodes`** - Stores graph nodes with coordinates

   - `node_id` (SERIAL PRIMARY KEY)
   - `node_index` (INTEGER UNIQUE) - The array index (0-97)
   - `latitude` (DECIMAL 10,8)
   - `longitude` (DECIMAL 11,8)
   - `created_at`, `updated_at` timestamps

2. **`navigation_edges`** - Stores connections between nodes
   - `edge_id` (SERIAL PRIMARY KEY)
   - `edge_code` (VARCHAR 20 UNIQUE) - e.g., "0_1", "1_2"
   - `from_node` (INTEGER) - Source node index
   - `to_node` (INTEGER) - Destination node index
   - `path_coordinates` (JSONB) - Array of [lat, lng] waypoints
   - `created_at`, `updated_at` timestamps

## 🚀 Setup Steps

### Step 1: Run Database Schema

```bash
# Navigate to SQL directory
cd backend/Maps/backend\ map/sql

# Run schema creation (creates tables)
psql -U postgres -d engx -f navigation_schema.sql
```

### Step 2: Import Existing Data

```bash
# Import all 98 nodes and 105 edges from path.json
psql -U postgres -d engx -f import_navigation_data.sql
```

### Step 3: Verify Data

```sql
-- Check node count (should be 98)
SELECT COUNT(*) FROM navigation_nodes;

-- Check edge count (should be 105)
SELECT COUNT(*) FROM navigation_edges;

-- View sample data
SELECT * FROM navigation_nodes LIMIT 5;
SELECT * FROM navigation_edges LIMIT 5;
```

## 🔌 API Endpoints (Port 3001)

### GET Endpoints

#### Get All Nodes

```http
GET http://localhost:3001/api/navigation/nodes
```

**Response:**

```json
[
  { "lat": 7.252250, "lng": 80.593341 },
  { "lat": 7.252279, "lng": 80.593029 },
  ...
]
```

#### Get All Edges

```http
GET http://localhost:3001/api/navigation/edges
```

**Response:**

```json
[
  {
    "id": "0_1",
    "from": 0,
    "to": 1,
    "coords": [[7.252250, 80.593341], [7.252279, 80.593029]]
  },
  ...
]
```

#### Get Complete Graph (Nodes + Edges)

```http
GET http://localhost:3001/api/navigation/graph
```

**Response:**

```json
{
  "nodes": [
    /* array of nodes */
  ],
  "edges": [
    /* array of edges */
  ]
}
```

#### Get Specific Node

```http
GET http://localhost:3001/api/navigation/node/81
```

**Response:**

```json
{
  "index": 81,
  "lat": 7.25441,
  "lng": 80.5922
}
```

### POST/PUT/DELETE Endpoints

#### Create New Node

```http
POST http://localhost:3001/api/navigation/node
Content-Type: application/json

{
  "node_index": 98,
  "latitude": 7.254500,
  "longitude": 80.592500
}
```

#### Update Node Coordinates

```http
PUT http://localhost:3001/api/navigation/node/81
Content-Type: application/json

{
  "latitude": 7.254410,
  "longitude": 80.592220
}
```

#### Delete Node

```http
DELETE http://localhost:3001/api/navigation/node/98
```

## 🔄 Frontend Integration

### Update NodeVisualizer to Fetch from API

**Before (hardcoded):**

```javascript
import pathData from "../../../backend/Maps/backend map/path.json";
```

**After (API):**

```javascript
const [nodesData, setNodesData] = useState(null);

useEffect(() => {
  fetch("http://localhost:3001/api/navigation/graph")
    .then((res) => res.json())
    .then((data) => setNodesData(data))
    .catch((err) => console.error("Failed to load navigation graph:", err));
}, []);
```

### Update routing.js to Fetch from API

**Before:**

```javascript
const pathData = require("./path.json");
```

**After:**

```javascript
let cachedGraphData = null;

async function loadGraphData() {
  if (cachedGraphData) return cachedGraphData;

  const response = await fetch("http://localhost:3001/api/navigation/graph");
  cachedGraphData = await response.json();
  return cachedGraphData;
}
```

## ✅ Benefits

1. **Dynamic Updates** - Change nodes/edges without restarting server
2. **Version Control** - Track changes with timestamps
3. **Data Integrity** - Foreign key constraints ensure valid connections
4. **Scalability** - Easy to add new nodes/edges via API
5. **Backup & Recovery** - Standard database backup tools
6. **Query Flexibility** - SQL queries for analytics and debugging

## 📊 Database Maintenance

### Backup Navigation Data

```bash
pg_dump -U postgres -d engx -t navigation_nodes -t navigation_edges > navigation_backup.sql
```

### Restore Navigation Data

```bash
psql -U postgres -d engx < navigation_backup.sql
```

### Find Isolated Nodes (No Edges)

```sql
SELECT n.node_index, n.latitude, n.longitude
FROM navigation_nodes n
LEFT JOIN navigation_edges e1 ON n.node_index = e1.from_node
LEFT JOIN navigation_edges e2 ON n.node_index = e2.to_node
WHERE e1.edge_id IS NULL AND e2.edge_id IS NULL;
```

### Count Connections Per Node

```sql
SELECT node_index,
       COUNT(DISTINCT e1.edge_id) + COUNT(DISTINCT e2.edge_id) as connection_count
FROM navigation_nodes n
LEFT JOIN navigation_edges e1 ON n.node_index = e1.from_node
LEFT JOIN navigation_edges e2 ON n.node_index = e2.to_node
GROUP BY node_index
ORDER BY connection_count DESC;
```

## 🎯 Next Steps

1. ✅ Run SQL scripts to create tables and import data
2. ✅ Test API endpoints using Postman or browser
3. ✅ Updated `routing.js` to fetch from database with fallback to path.json
4. ✅ Updated `NodeVisualizer.jsx` to use API endpoint with fallback
5. ⏳ Configure `db.js` with correct database credentials
6. ⏳ Test database connection and API endpoints
7. 📦 Keep `path.json` as fallback (DO NOT DELETE)
8. 🔄 Add API endpoints for edge management (POST/PUT/DELETE edges)

## 🔧 Troubleshooting

### System Behavior

**When Database is Available:**

```
✅ Routing loaded from database: 98 nodes, 105 edges
✅ NodeVisualizer: Loaded from API - 98 nodes, 105 edges
```

**When Database is Unavailable:**

```
⚠️ Database unavailable, falling back to path.json: [error message]
📁 Routing loaded from path.json: 98 nodes, 105 edges
⚠️ NodeVisualizer: API failed, loading from path.json
📁 NodeVisualizer: Loaded from path.json - 98 nodes, 105 edges
```

### Common Issues

**Error: "client password must be a string"**

- Check `.env` file has `DB_PASSWORD` set correctly
- Ensure `db.js` is loading environment variables properly
- Verify no extra quotes or whitespace in password

**API Returns Error But Path.json Works**

- This is normal! System will use fallback automatically
- Check server logs to see which data source is being used
- No action needed unless you specifically need database features

**Cache Refresh**

- Restart server to clear cached data and reload from database
- Or modify `routing.js` to add cache invalidation API endpoint

## 📝 Notes

- All coordinates stored with 8 decimal places for precision
- JSONB format allows efficient querying of path coordinates
- Foreign key constraints automatically delete edges when nodes are removed
- Timestamps track creation and modification times
- Indexes optimize lookups by node_index and edge relationships
- **path.json serves as permanent fallback** - do not delete this file!
