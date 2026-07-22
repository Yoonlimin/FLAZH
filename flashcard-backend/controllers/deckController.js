const pool = require('../config/db');

// Create Flashbook
exports.createFlashbook = async (req, res) => {
  const { userId, title } = req.body;
  if (!title) return res.status(400).json({ error: 'Flashbook title is required' });

  try {
    const newDeck = await pool.query(
      'INSERT INTO flashbooks (user_id, title) VALUES ($1, $2) RETURNING *',
      [userId, title.trim()]
    );
    return res.status(201).json(newDeck.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Get All Flashbooks for User
exports.getFlashbooks = async (req, res) => {
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
};