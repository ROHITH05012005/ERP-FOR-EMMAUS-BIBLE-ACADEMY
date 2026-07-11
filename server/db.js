const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    // Create Tables
    db.serialize(() => {
      // Users Table
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        username TEXT UNIQUE,
        password TEXT,
        role TEXT
      )`);

      // Attendance Table
      db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        date TEXT,
        status TEXT,
        FOREIGN KEY(studentId) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Assignments Table
      db.run(`CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        assignmentName TEXT,
        score INTEGER,
        FOREIGN KEY(studentId) REFERENCES users(id) ON DELETE CASCADE
      )`);

      // Topics Table
      db.run(`CREATE TABLE IF NOT EXISTS topics (
        date TEXT PRIMARY KEY,
        topicName TEXT
      )`);
    });
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;
