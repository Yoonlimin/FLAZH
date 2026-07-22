const pool = require('../config/db');
const bcrypt = require('bcrypt');

exports.continueAuth = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter both email and password.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 1. Check if user already exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [cleanEmail]);

    if (userResult.rows.length > 0) {
      // 🔑 USER EXISTS -> LOGIN
      const user = userResult.rows[0];

      // Check password match
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
      // ✨ NEW USER -> REGISTER
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = await pool.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
        [cleanEmail, passwordHash]
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
};