const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import your new route files
const authRoutes = require('./routes/authRoutes');
const flashbookRoutes = require('./routes/flashbookRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount the Routes
app.use('/api/auth', authRoutes);
app.use('/api/flashbooks', flashbookRoutes);
app.use('/api/flashcards', flashcardRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});