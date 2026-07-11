const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Create Tables
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        "studentId" TEXT,
        date TEXT,
        status TEXT,
        FOREIGN KEY("studentId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        "studentId" TEXT,
        "assignmentName" TEXT,
        score INTEGER,
        FOREIGN KEY("studentId") REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS topics (
        date TEXT PRIMARY KEY,
        "topicName" TEXT
      )
    `);
    
    console.log('Connected to Postgres and ensured tables exist.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

initDB();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
