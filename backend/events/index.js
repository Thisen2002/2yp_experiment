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
// app.use("/api/interests", userinterestsRouter);



// ------------------- START SERVER -------------------
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});



//heatmap   backend

// Register each feature router
app.use('/heatmap', require('./heatmap/heatmap'));       // Heatmap data from CCTV
// app.use('/api', require('./routes/sample_buildings'));  // Demo building data
app.get('/heatmap/health', (req, res) => res.json({ msg: "Hello from backend!" }));            // Home route
// ===============================
// SERVER STARTUP
// ===============================
// const PORT = process.env.PORT || process.env.BACKEND_HEATMAP_SERVICE_PORT || 3897;
// app.listen(PORT, () => console.log(`API running on port ${PORT}`));