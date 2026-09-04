const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Add a new flashcard
router.post('/', async (req, res) => {
  try {
    const { flashbook_id, word, description, meaning, image_url } = req.body;
    
    const newCard = await pool.query( 
      'INSERT INTO flashcards (flashbook_id, word, description, meaning, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [flashbook_id, word, description, meaning, image_url]
    );
    
    res.json(newCard.rows[0]);
  } catch (err) {
    console.error("Error saving flashcard:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all flashcards for a specific flashbook
router.get('/:deckId', async (req, res) => {
  try {
    const { deckId } = req.params;
    const cards = await pool.query(
      'SELECT * FROM flashcards WHERE flashbook_id = $1 ORDER BY created_at ASC',
      [deckId]
    );
    res.json(cards.rows);
  } catch (err) {
    console.error("Error fetching cards:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update a flashcard
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { word, description, meaning, image_url } = req.body;
    
    const updatedCard = await pool.query(
      'UPDATE flashcards SET word = $1, description = $2, meaning = $3, image_url = $4 WHERE id = $5 RETURNING *',
      [word, description, meaning, image_url, id]
    );
    
    if (updatedCard.rows.length === 0) {
      return res.status(404).json({ error: "Flashcard not found" });
    }
    
    res.json(updatedCard.rows[0]);
  } catch (err) {
    console.error("Error updating flashcard:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete a flashcard
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedCard = await pool.query(
      'DELETE FROM flashcards WHERE id = $1 RETURNING *',
      [id]
    );

    if (deletedCard.rows.length === 0) {
      return res.status(404).json({ error: "Flashcard not found" });
    }

    res.json({ message: "Flashcard deleted successfully" });
  } catch (err) {
    console.error("Error deleting flashcard:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;