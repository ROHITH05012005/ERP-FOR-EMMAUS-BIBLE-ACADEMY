const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '../dist')));

// --- USERS API ---
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { id, name, username, password, role } = req.body;
  db.run('INSERT INTO users (id, name, username, password, role) VALUES (?, ?, ?, ?, ?)', 
    [id, name, username, password, role], 
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.put('/api/users/:id', (req, res) => {
  const { name, username, password } = req.body;
  db.run('UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?',
    [name, username, password, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

app.delete('/api/users/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- ATTENDANCE API ---
app.get('/api/attendance', (req, res) => {
  db.all('SELECT * FROM attendance', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/attendance', (req, res) => {
  const { studentId, date, status } = req.body;
  
  db.get('SELECT id FROM attendance WHERE studentId = ? AND date = ?', [studentId, date], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      db.run('UPDATE attendance SET status = ? WHERE id = ?', [status, row.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    } else {
      const id = Date.now().toString() + Math.random().toString();
      db.run('INSERT INTO attendance (id, studentId, date, status) VALUES (?, ?, ?, ?)', 
        [id, studentId, date, status], 
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true });
        }
      );
    }
  });
});

// --- ASSIGNMENTS API ---
app.get('/api/assignments', (req, res) => {
  db.all('SELECT * FROM assignments', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/assignments/bulk', (req, res) => {
  const newAssignments = req.body;
  const time = Date.now();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    let errorOccurred = false;

    newAssignments.forEach((assign, idx) => {
      db.get('SELECT id FROM assignments WHERE studentId = ? AND LOWER(assignmentName) = LOWER(?)', 
        [assign.studentId, assign.assignmentName], 
        (err, row) => {
          if (err) errorOccurred = true;
          if (row) {
            db.run('UPDATE assignments SET score = ? WHERE id = ?', [assign.score, row.id]);
          } else {
            const id = (time + idx).toString();
            db.run('INSERT INTO assignments (id, studentId, assignmentName, score) VALUES (?, ?, ?, ?)', 
              [id, assign.studentId, assign.assignmentName, assign.score]);
          }
      });
    });

    db.run('COMMIT', (err) => {
      if (err || errorOccurred) return res.status(500).json({ error: 'Bulk insert failed' });
      res.json({ success: true });
    });
  });
});

// --- TOPICS API ---
app.get('/api/topics', (req, res) => {
  db.all('SELECT * FROM topics', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const topicsObj = {};
    rows.forEach(r => topicsObj[r.date] = r.topicName);
    res.json(topicsObj);
  });
});

app.post('/api/topics', (req, res) => {
  const { date, topicName } = req.body;
  db.get('SELECT date FROM topics WHERE date = ?', [date], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      db.run('UPDATE topics SET topicName = ? WHERE date = ?', [topicName, date], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    } else {
      db.run('INSERT INTO topics (date, topicName) VALUES (?, ?)', [date, topicName], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    }
  });
});

// --- EMAIL API ---
app.post('/api/send-report', async (req, res) => {
  const { recipientEmail, selectedWeek, currentTopic, totalStudents, presentSelectedWeek, csvContent } = req.body;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ error: "Email credentials not configured on server (.env missing EMAIL_USER or EMAIL_PASS)" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: `Weekly Class Report - ${selectedWeek}`,
      text: `Please find the weekly class report for ${selectedWeek} attached.\n\nTopic Covered: ${currentTopic}\n\nClass Overview:\n- Total Students: ${totalStudents}\n- Present: ${presentSelectedWeek}\n- Absent: ${totalStudents - presentSelectedWeek}\n\nAutomated by Emmaus Bible Academy System.`,
      attachments: [
        {
          filename: `student_report_${selectedWeek}.csv`,
          content: csvContent
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ error: 'Failed to send email. Check credentials.' });
  }
});

// Catch-all route to serve React app for any unknown paths (React Router support)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
