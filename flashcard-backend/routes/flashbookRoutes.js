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

// ✨ 1. DELETE route for Flashbooks
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Make sure your DB connection variable (like 'pool' or 'db') matches what you use at the top of this file!
    await pool.query('DELETE FROM flashbooks WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Flashbook deleted successfully' });
  } catch (error) {
    console.error("Error deleting flashbook:", error);
    res.status(500).json({ error: 'Failed to delete flashbook' });
  }
});

// ✨ 2. PUT route to toggle Pin Status
router.put('/:id/pin', async (req, res) => {
  const { id } = req.params;
  const { isPinned } = req.body; 

  try {
    await pool.query(
      'UPDATE flashbooks SET "isPinned" = $1 WHERE id = $2', 
      [isPinned, id]
    );
    
    res.status(200).json({ message: 'Pin status updated successfully', isPinned });
  } catch (error) {
    console.error("Error updating pin status:", error);
    res.status(500).json({ error: 'Failed to update pin status' });
  }
});

module.exports = router;