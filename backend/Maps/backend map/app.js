const express = require("express");
const http = require('http');
const {Server} = require('socket.io');
const cors = require("cors");
const bodyParser = require("body-parser");
const routing = require("./routing");
const routeFromArbitraryPoint = routing.default || routing.routeFromArbitraryPoint || routing;
const clearNavigationCache = routing.clearNavigationCache;
const searchDatabase = require('./search');
const fs = require('fs/promises');
const pool = require('./db');  // PostgreSQL connection


const app = express();


const server = http.createServer(app);
const io = new Server(server, {
  cors: {origin: "*"}
});

app.use(cors());
app.use(bodyParser.json()); // parse JSON payloads

const HTTP_PORT = process.env.PORT || process.env.BACKEND_MAPS_SERVICE_PORT || 3001;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Listen for location updates
  socket.on("position-update", async (data) => {
    
    console.log(`Received from ${socket.id}: lat=${data.coords[0]}, lng=${data.coords[1]}, dest=${data.node}`);

    // Do calculations
    if (data.node === null || data.node === undefined) {
      console.log(`No destination node provided by ${socket.id}`);
      return;
    }

    if (data.coords === null || data.coords === undefined || data.coords.length !== 2) {
      console.log(`Invalid coordinates provided by ${socket.id}`);
      return;
      
    }

    try {
      const route = await routeFromArbitraryPoint(data.coords, data.node);
      // Send back response
      socket.emit("route-update", route);
    } catch (error) {
      console.error(`❌ Error calculating route for ${socket.id}:`, error);
      socket.emit("route-error", { error: "Failed to calculate route" });
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- REST endpoints for map + building info ---
// Commented out - these endpoints reference undefined variables
// app.get("/api/buildings", (req, res) => {
//   const withTraffic = {
//     ...buildings,
//     features: buildings.features.map(f => ({
//       ...f,
//       properties: { ...f.properties, traffic: traffic[f.properties.id] }
//     }))
//   };
//   res.json(withTraffic);
// });

// app.get("/api/building/:id", (req, res) => {
//   const id = Number(req.params.id);
//   if (!detailsById[id]) return res.status(404).json({ error: "Not found" });
//   res.json({ ...detailsById[id], traffic: traffic[id] });
// });


app.get('/map', async (req, res) => {
  try {
    const svgContent = await fs.readFile('./map.svg', 'utf8');
    res.set('Content-Type', 'text/plain'); // Send as plain text
    res.send(svgContent);
    console.log('requested /map: map file served')
  } catch (error) {
    console.error('Error reading SVG file:', error.message);
    res.status(500).json({ error: 'Failed to read SVG file' });
  }
});

app.get("/api/search", (req, res) => {
  const { query, category, zone, subzone } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const results = searchDatabase(query, { category, zone, subzone });
  res.json(results);
});

// =====================================================
// NAVIGATION GRAPH API ENDPOINTS
// =====================================================

// GET /api/navigation/nodes - Get all navigation nodes
app.get("/api/navigation/nodes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT node_index, latitude, longitude
      FROM navigation_nodes
      ORDER BY node_index ASC
    `);
    
    // Transform to match path.json format: array of {lat, lng}
    const nodes = result.rows.map(row => ({
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude)
    }));
    
    res.json(nodes);
    console.log(`✅ Served ${nodes.length} navigation nodes`);
  } catch (error) {
    console.error('❌ Error fetching navigation nodes:', error);
    res.status(500).json({ error: 'Failed to fetch navigation nodes' });
  }
});

// GET /api/navigation/edges - Get all navigation edges
app.get("/api/navigation/edges", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT edge_code as id, from_node as "from", to_node as "to", path_coordinates as coords
      FROM navigation_edges
      ORDER BY edge_id ASC
    `);
    
    // Transform JSONB coords to plain arrays
    const edges = result.rows.map(row => ({
      id: row.id,
      from: row.from,
      to: row.to,
      coords: row.coords  // Already parsed from JSONB
    }));
    
    res.json(edges);
    console.log(`✅ Served ${edges.length} navigation edges`);
  } catch (error) {
    console.error('❌ Error fetching navigation edges:', error);
    res.status(500).json({ error: 'Failed to fetch navigation edges' });
  }
});

// GET /api/navigation/graph - Get complete graph (nodes + edges)
app.get("/api/navigation/graph", async (req, res) => {
  try {
    // Fetch both nodes and edges in parallel
    const [nodesResult, edgesResult] = await Promise.all([
      pool.query(`
        SELECT node_index, latitude, longitude
        FROM navigation_nodes
        ORDER BY node_index ASC
      `),
      pool.query(`
        SELECT edge_code as id, from_node as "from", to_node as "to", path_coordinates as coords
        FROM navigation_edges
        ORDER BY edge_id ASC
      `)
    ]);
    
    // Transform to match path.json format (with node_index included)
    const nodes = nodesResult.rows.map(row => ({
      index: row.node_index,  // Include the node_index
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude)
    }));
    
    const edges = edgesResult.rows.map(row => ({
      id: row.id,
      from: row.from,
      to: row.to,
      coords: row.coords
    }));
    
    res.json({ nodes, edges });
    console.log(`✅ Served complete navigation graph: ${nodes.length} nodes, ${edges.length} edges (from DATABASE)`);
  } catch (error) {
    console.error('❌ Error fetching navigation graph:', error);
    res.status(500).json({ error: 'Failed to fetch navigation graph' });
  }
});

// GET /api/navigation/cache/status - Check cache status
app.get("/api/navigation/cache/status", (req, res) => {
  const status = routing.getCacheStatus ? routing.getCacheStatus() : { error: 'Function not available' };
  res.json(status);
});

// GET /api/navigation/node/:index - Get specific node by index
app.get("/api/navigation/node/:index", async (req, res) => {
  try {
    const nodeIndex = parseInt(req.params.index);
    
    if (isNaN(nodeIndex)) {
      return res.status(400).json({ error: 'Invalid node index' });
    }
    
    const result = await pool.query(`
      SELECT node_index, latitude, longitude
      FROM navigation_nodes
      WHERE node_index = $1
    `, [nodeIndex]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    const node = {
      index: result.rows[0].node_index,
      lat: parseFloat(result.rows[0].latitude),
      lng: parseFloat(result.rows[0].longitude)
    };
    
    res.json(node);
  } catch (error) {
    console.error('❌ Error fetching node:', error);
    res.status(500).json({ error: 'Failed to fetch node' });
  }
});

// POST /api/navigation/node - Add new node
app.post("/api/navigation/node", async (req, res) => {
  try {
    const { node_index, latitude, longitude } = req.body;
    
    if (node_index === undefined || !latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Missing required fields: node_index, latitude, longitude' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO navigation_nodes (node_index, latitude, longitude)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [node_index, latitude, longitude]);
    
    // Clear routing cache since data changed
    clearNavigationCache();
    
    res.status(201).json({
      message: 'Node created successfully',
      node: result.rows[0]
    });
    console.log(`✅ Created new node ${node_index} at [${latitude}, ${longitude}]`);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Node index already exists' });
    } else {
      console.error('❌ Error creating node:', error);
      res.status(500).json({ error: 'Failed to create node' });
    }
  }
});

// PUT /api/navigation/node/:index - Update node coordinates
app.put("/api/navigation/node/:index", async (req, res) => {
  try {
    const nodeIndex = parseInt(req.params.index);
    const { latitude, longitude } = req.body;
    
    console.log(`🔧 PUT /api/navigation/node/${nodeIndex} - Updating to [${latitude}, ${longitude}]`);
    
    if (isNaN(nodeIndex) || !latitude || !longitude) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }
    
    // Start a transaction to update both node and connected edges
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Update the node
      const nodeResult = await client.query(`
        UPDATE navigation_nodes
        SET latitude = $1, longitude = $2, updated_at = CURRENT_TIMESTAMP
        WHERE node_index = $3
        RETURNING *
      `, [latitude, longitude, nodeIndex]);
      
      if (nodeResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Node not found' });
      }
      
      // Find all edges connected to this node
      const edgesResult = await client.query(`
        SELECT edge_code, from_node, to_node, path_coordinates
        FROM navigation_edges
        WHERE from_node = $1 OR to_node = $1
      `, [nodeIndex]);
      
      console.log(`📊 Found ${edgesResult.rows.length} edges connected to node ${nodeIndex}`);
      
      // Update each connected edge's path coordinates
      for (const edge of edgesResult.rows) {
        let coords = edge.path_coordinates;
        
        // Update first coordinate if this node is the 'from' node
        if (edge.from_node === nodeIndex && coords.length > 0) {
          coords[0] = [parseFloat(latitude), parseFloat(longitude)];
          console.log(`  ✏️ Updated edge ${edge.edge_code} start point`);
        }
        
        // Update last coordinate if this node is the 'to' node
        if (edge.to_node === nodeIndex && coords.length > 0) {
          coords[coords.length - 1] = [parseFloat(latitude), parseFloat(longitude)];
          console.log(`  ✏️ Updated edge ${edge.edge_code} end point`);
        }
        
        // Save updated coordinates back to database
        await client.query(`
          UPDATE navigation_edges
          SET path_coordinates = $1, updated_at = CURRENT_TIMESTAMP
          WHERE edge_code = $2
        `, [JSON.stringify(coords), edge.edge_code]);
      }
      
      await client.query('COMMIT');
      
      // Clear routing cache since data changed
      console.log(`🗑️ ABOUT TO CLEAR CACHE for node ${nodeIndex} update`);
      clearNavigationCache();
      console.log(`✅ Cache cleared, should reload on next navigation`);
      
      res.json({
        message: 'Node updated successfully',
        node: nodeResult.rows[0],
        updatedEdges: edgesResult.rows.length
      });
      console.log(`✅ Updated node ${nodeIndex} to [${latitude}, ${longitude}] and ${edgesResult.rows.length} connected edges`);
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error updating node:', error);
    res.status(500).json({ error: 'Failed to update node' });
  }
});

// DELETE /api/navigation/node/:index - Delete node
app.delete("/api/navigation/node/:index", async (req, res) => {
  try {
    const nodeIndex = parseInt(req.params.index);
    
    if (isNaN(nodeIndex)) {
      return res.status(400).json({ error: 'Invalid node index' });
    }
    
    const result = await pool.query(`
      DELETE FROM navigation_nodes
      WHERE node_index = $1
      RETURNING node_index
    `, [nodeIndex]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Node not found' });
    }
    
    // Clear routing cache since data changed
    clearNavigationCache();
    
    res.json({
      message: 'Node deleted successfully',
      deleted_node_index: result.rows[0].node_index
    });
    console.log(`✅ Deleted node ${nodeIndex}`);
  } catch (error) {
    console.error('❌ Error deleting node:', error);
    res.status(500).json({ error: 'Failed to delete node' });
  }
});

// POST /api/navigation/edge - Create new edge
app.post("/api/navigation/edge", async (req, res) => {
  try {
    const { edge_code, from_node, to_node, path_coordinates } = req.body;
    
    if (!edge_code || from_node === undefined || to_node === undefined || !path_coordinates) {
      return res.status(400).json({ 
        error: 'Missing required fields: edge_code, from_node, to_node, path_coordinates' 
      });
    }
    
    // Validate path_coordinates is an array
    if (!Array.isArray(path_coordinates)) {
      return res.status(400).json({ error: 'path_coordinates must be an array' });
    }
    
    const result = await pool.query(`
      INSERT INTO navigation_edges (edge_code, from_node, to_node, path_coordinates)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [edge_code, from_node, to_node, JSON.stringify(path_coordinates)]);
    
    // Clear routing cache since data changed
    clearNavigationCache();
    
    res.status(201).json({
      message: 'Edge created successfully',
      edge: {
        id: result.rows[0].edge_code,
        from: result.rows[0].from_node,
        to: result.rows[0].to_node,
        coords: result.rows[0].path_coordinates
      }
    });
    console.log(`✅ Created edge ${edge_code}: ${from_node} → ${to_node}`);
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Edge already exists' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid node reference - node(s) do not exist' });
    } else {
      console.error('❌ Error creating edge:', error);
      res.status(500).json({ error: 'Failed to create edge' });
    }
  }
});

// DELETE /api/navigation/edge/:edge_code - Delete an edge
app.delete("/api/navigation/edge/:edge_code", async (req, res) => {
  try {
    const edgeCode = req.params.edge_code;
    
    console.log(`🗑️ DELETE /api/navigation/edge/${edgeCode}`);
    
    const result = await pool.query(`
      DELETE FROM navigation_edges
      WHERE edge_code = $1
      RETURNING *
    `, [edgeCode]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Edge not found' });
    }
    
    // Clear routing cache since data changed
    console.log(`🗑️ CLEARING CACHE after edge ${edgeCode} deletion`);
    clearNavigationCache();
    console.log(`✅ Cache cleared`);
    
    res.json({
      message: 'Edge deleted successfully',
      edge: result.rows[0]
    });
    console.log(`✅ Deleted edge ${edgeCode}`);
  } catch (error) {
    console.error('❌ Error deleting edge:', error);
    res.status(500).json({ error: 'Failed to delete edge' });
  }
});


server.listen(HTTP_PORT, () => {
  console.log(`Server running on http://localhost:${HTTP_PORT}`);
});
