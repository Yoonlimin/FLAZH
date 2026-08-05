const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Create Flashbook
router.post('/', async (req, res) => {
  // ✨ Includes the 'color' we added earlier!
  const { userId, title, color } = req.body; 
  
  if (!title) return res.status(400).json({ error: 'Flashbook title is required' });

  try {
    const newDeck = await pool.query(
      'INSERT INTO flashbooks (user_id, title, color) VALUES ($1, $2, $3) RETURNING *',
      [userId, title.trim(), color]
    );
    return res.status(201).json(newDeck.rows[0]);
  } catch (error) {
    console.error("Error saving flashbook:", error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get All Flashbooks for User
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userDecks = await pool.query(
      'SELECT * FROM flashbooks WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    return res.json(userDecks.rows);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;