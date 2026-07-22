const express = require('express');
const router = express.Router();
const deckController = require('../controllers/deckController');

router.post('/', deckController.createFlashbook);
router.get('/:userId', deckController.getFlashbooks);

module.exports = router;