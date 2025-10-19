const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/buildings', buildingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/heatmap', heatmapRoutes);
app.use('/api/export', exportRoutes);

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
            export: '/api/export'
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