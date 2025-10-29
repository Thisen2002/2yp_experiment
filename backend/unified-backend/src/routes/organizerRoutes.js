const express = require("express");
const router = express.Router();

const {
    getOrganizers,
    getOrganizerById,
    updateOrganizer,
    deleteOrganizer
} = require('../controllers/organizerController');

// Get all organizers
router.get('/', getOrganizers);

// Get a single organizer by Id
router.get('/:id', getOrganizerById);

// PUT update organizer
router.put('/:id', updateOrganizer);

// Delete an organizer
router.delete('/:id', deleteOrganizer);

module.exports = router;