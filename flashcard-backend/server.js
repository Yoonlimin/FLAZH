const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✨ ADD THIS LINE to import the database pool!
const pool = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const deckRoutes = require('./routes/deckRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashbooks', deckRoutes);

// Add a new flashcard
app.post('/api/flashcards', async (req, res) => {
  try {
    const { flashbook_id, word, description, image_url } = req.body;
    
    // Now 'pool' will work perfectly!
    const newCard = await pool.query( 
      'INSERT INTO flashcards (flashbook_id, word, description, image_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [flashbook_id, word, description, image_url]
    );
    
    res.json(newCard.rows[0]);
  } catch (err) {
    console.error("Error saving flashcard:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});