const express = require('express');
const router = express.Router();
const {
    getBuildings,
    getBuildingById,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    getBuildingsByTag,
    getTags
} = require('../controllers/buildingController');

// Get all buildings
router.get('/', getBuildings);

// Get buildings by tag - MUST be before /:id route
router.get('/filterByTag', getBuildingsByTag);

// Get tags list
router.get('/tags', getTags);

// Get building by ID
router.get('/:id', getBuildingById);

// Create new building
router.post('/', createBuilding);

// Update building
router.put('/:id', updateBuilding);

// Delete building
router.delete('/:id', deleteBuilding);

module.exports = router;