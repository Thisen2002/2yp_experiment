const express = require('express');
const router = express.Router();
const visitorsController = require('../controllers/visitorsController');

// GET /api/visitors - Get all visitors with pagination
router.get('/', visitorsController.getVisitors);

// GET /api/visitors/:id - Get visitor by ID
router.get('/:id', visitorsController.getVisitorById);

// POST /api/visitors - Create new visitor
router.post('/', visitorsController.createVisitor);

// PUT /api/visitors/:id - Update visitor
router.put('/:id', visitorsController.updateVisitor);

// DELETE /api/visitors/:id - Delete visitor
router.delete('/:id', visitorsController.deleteVisitor);

module.exports = router;