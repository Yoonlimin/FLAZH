const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');

// Initialize Google Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✨ NEW: Google Auth Route
router.post('/google', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Google token is required.' });
  }

  try {
    // 1. Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const cleanEmail = payload.email.toLowerCase();
    const googleId = payload.sub;

    // 2. Check if user already exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userResult.rows.length > 0) {
      // 🔑 USER EXISTS -> LOGIN
      const user = userResult.rows[0];

      // Optional: If they previously signed up with email, we could link their Google ID here.
      // For now, we just log them in.
      return res.status(200).json({
        message: 'Welcome back!',
        isNewUser: false,
        user: { id: user.id, email: user.email },
      });
    } else {
      // ✨ NEW USER -> REGISTER WITH GOOGLE
      const newUser = await pool.query(
        'INSERT INTO users (email, auth_provider, google_id) VALUES ($1, $2, $3) RETURNING id, email',
        [cleanEmail, 'google', googleId]
      );

      return res.status(201).json({
        message: 'Account created with Google!',
        isNewUser: true,
        user: newUser.rows[0],
      });
    }
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    return res.status(500).json({ error: 'Google Authentication failed. Invalid token.' });
  }
});

// --- Existing Email/Password Route ---
router.post('/continue', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];

      // Block manual login if they only signed up with Google (no password)
      if (!user.password_hash) {
        return res.status(400).json({ error: 'This email is linked to Google Sign-In. Please use Google to continue.' });
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Incorrect password. Please try again.' });
      }

      return res.status(200).json({
        message: 'Welcome back!',
        isNewUser: false,
        user: { id: user.id, email: user.email },
      });

    } else {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash, auth_provider) VALUES ($1, $2, $3) RETURNING id, email',
        [cleanEmail, passwordHash, 'email']
      );

      return res.status(201).json({
        message: 'Account created!',
        isNewUser: true,
        user: newUser.rows[0],
      });
    }
  } catch (error) {
    console.error('Auth Error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;