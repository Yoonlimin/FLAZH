const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon cloud connection
  },
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Database connection failure:', err.stack);
  else console.log('✅ PostgreSQL pipeline securely online.');
});

module.exports = pool;