const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Configure CORS to allow frontend
const corsOptions = {
  origin: [
    'http://localhost:5173',  // Vite default port
    'http://localhost:3000',  // React default port  
    'http://localhost:5174',  // Alternative Vite port
    'http://127.0.0.1:5173',  // Alternative localhost
    'http://127.0.0.1:3000',  // Alternative localhost
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/authRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const eventRoutes = require('./routes/eventRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const heatmapRoutes = require('./routes/heatmapRoutes');
const exportRoutes = require('./routes/exportRoutes');
const visitorsRoutes = require('./routes/visitorsRoutes');
const entryExitRoutes = require('./routes/entryExitRoutes');
const dailyCountsRoutes = require('./routes/dailyCountsRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/events', eventRoutes);   //repeat
app.use('/api/buildings', buildingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/visitors', visitorsRoutes);
app.use('/api/entry-exit', entryExitRoutes);
app.use('/api/daily-counts', dailyCountsRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Unified Organizer Dashboard Backend API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            organizers: '/api/organizers',
            events: '/api/events',
            buildings: '/api/buildings',
            analytics: '/api/analytics',
            heatmap: '/api/heatmap',
            export: '/api/export',
            visitors: '/api/visitors',
            entryExit: '/api/entry-exit',
            dailyCounts: '/api/daily-counts'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Unified Backend Server running on port ${PORT}`);
    console.log(`📊 API Documentation available at http://localhost:${PORT}`);
});

module.exports = app;