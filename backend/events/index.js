const express = require("express");
require("dotenv").config();
const pool = require("./db");  // PostgreSQL connection pool
// Start periodic event sync
// require("./fetchAndSyncEvents");
const cookieParser = require("cookie-parser");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

// routes
const eventRoutes = require("./routes/events.routes");
const ratingsRoutes = require("./routes/ratings.routes");
const eventListRoutes = require("./routes/eventlist.routes");
const interestsRouter = require("./routes/interests.routes");
const userinterestsRouter = require("./routes/userinterests.routes");
const notificationsRoutes = require("./routes/notifications.routes");
const memoriesRoutes = require("./routes/memories.routes");

// set the main port
const app = express();
const PORT = process.env.PORT;
console.log('PORT from env:', PORT);

// Browsers block requests between different origins (ports, domains) by default. This enables your frontend to communicate with your backend.
const allowedOrigin = process.env.FRONTEND_ORIGIN;
console.log('FRONTEND_ORIGIN from env:', allowedOrigin);
app.use(
    cors({
        origin: allowedOrigin, //only take reguest from this origin
        credentials: true, // allow session cookies from browser to pass through
    })
);

app.use(express.json());
app.use(cookieParser());

// Set a stable userId cookie if missing
app.use((req, res, next) => {
    if (!req.cookies.userId) {
        res.cookie("userId", uuidv4(), {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: 31536000000, // 1 year
            path: "/",
        });
    }
    next();
});

// ------------------- TEST ROUTE -------------------
app.get("/", async (req, res) => {
    try {
        // Query your local Events table
        const result = await pool.query(`
            SELECT 
                event_id,
                event_name,
                start_time,
                end_time,
                location,
                description,
                event_categories
            FROM Events 
            ORDER BY start_time DESC
            LIMIT 8
        `);
        
        res.send({ 
            message: "✅ Connected to PostgreSQL Database: engx", 
            sampleRows: result.rows,
            totalEvents: result.rows.length
        });
    } catch (err) {
        console.error("❌ PostgreSQL error:", err.message);
        res.status(500).send({
            error: "Connection failed!",
            details: err.message
        });
    }
});

// ------------------- USE ROUTES -------------------
// Mount more specific /api/events/* routes before /api/events/:id
app.use("/api", interestsRouter); // includes /events/recommended, /events/discover, etc.
app.use("/api/events", eventListRoutes); // /api/events list
app.use("/api", ratingsRoutes);
app.use("/api", eventRoutes); // includes /events/:id and related
app.use("/api/interests", userinterestsRouter);
// Notifications API (create/list/fetch)
app.use("/api", notificationsRoutes);
app.use("/api", memoriesRoutes);



// ------------------- START SERVER -------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



//heatmap   backend----------------------------------------------------------------------------------------------------------------------------------------------------

// Register each feature router
app.use('/heatmap', require('./heatmap/heatmap'));       // Heatmap data from CCTV
// app.use('/api', require('./routes/sample_buildings'));  // Demo building data
app.get('/heatmap/health', (req, res) => res.json({ msg: "Hello from backend!" }));            // Home route
// ===============================
// SERVER STARTUP
// ===============================
// const PORT = process.env.PORT || process.env.BACKEND_HEATMAP_SERVICE_PORT || 3897;
// app.listen(PORT, () => console.log(`API running on port ${PORT}`));


//maps backend--------------------------------------------------------------------------------------------------------------------------------------------
// const express = require("express");
const http = require('http');
const {Server} = require('socket.io');
// const cors = require("cors");
const bodyParser = require("body-parser");
const routeFromArbitraryPoint = require("./maps/routing")
const searchDatabase = require('./maps/search');
const fs = require('fs/promises');


const server = http.createServer(app);
const io = new Server(server, {
  cors: {origin: "*"}
});

app.use(cors());
app.use(bodyParser.json()); // parse JSON payloads

const HTTP_PORT = process.env.PORT || process.env.BACKEND_MAPS_SERVICE_PORT || 3036;

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Listen for location updates
  socket.on("position-update", (data) => {
    
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


    const route = routeFromArbitraryPoint(data.coords, data.node);

    // Send back response
    socket.emit("route-update", route);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --- REST endpoints for map + building info ---
app.get("/api/buildings", (req, res) => {
  const withTraffic = {
    ...buildings,
    features: buildings.features.map(f => ({
      ...f,
      properties: { ...f.properties, traffic: traffic[f.properties.id] }
    }))
  };
  res.json(withTraffic);
});

app.get("/api/building/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!detailsById[id]) return res.status(404).json({ error: "Not found" });
  res.json({ ...detailsById[id], traffic: traffic[id] });
});



app.get('/map', async (req, res) => {
  try {
    const svgContent = await fs.readFile('./maps/map.svg', 'utf8');
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


// server.listen(HTTP_PORT, () => {
//   console.log(`Server running on http://localhost:${HTTP_PORT}`);
// });

app.get('/maps/health', (req, res) => res.json({ msg: "Hello from maps backend!" }));            // Home route

