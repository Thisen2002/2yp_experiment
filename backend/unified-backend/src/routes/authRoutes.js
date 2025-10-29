const express = require('express');
const router = express.Router();
const { register, login, approve } = require('../controllers/authController');

// Register a new organizer
router.post('/register', register);

// Login an organizer and return JWT
router.post('/login', login);

// Admin approval endpoint
router.get('/approve/:id', approve);
router.put('/approve/:id', approve);

module.exports = router;