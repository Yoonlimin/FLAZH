const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Point POST /api/auth/continue to the smart controller
router.post('/continue', authController.continueAuth);

module.exports = router;