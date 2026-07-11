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
app.get('/api/users', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { id, name, username, password, role } = req.body;
  try {
    await db.query('INSERT INTO users (id, name, username, password, role) VALUES ($1, $2, $3, $4, $5)', 
      [id, name, username, password, role]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { name, username, password } = req.body;
  try {
    await db.query('UPDATE users SET name = $1, username = $2, password = $3 WHERE id = $4',
      [name, username, password, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ATTENDANCE API ---
app.get('/api/attendance', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, "studentId", date, status FROM attendance');
    // Map to camelCase for frontend
    const mapped = rows.map(r => ({ id: r.id, studentId: r.studentId || r.studentid, date: r.date, status: r.status }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/attendance', async (req, res) => {
  const { studentId, date, status } = req.body;
  try {
    const { rows } = await db.query('SELECT id FROM attendance WHERE "studentId" = $1 AND date = $2', [studentId, date]);
    if (rows.length > 0) {
      await db.query('UPDATE attendance SET status = $1 WHERE id = $2', [status, rows[0].id]);
    } else {
      const id = Date.now().toString() + Math.random().toString();
      await db.query('INSERT INTO attendance (id, "studentId", date, status) VALUES ($1, $2, $3, $4)', 
        [id, studentId, date, status]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ASSIGNMENTS API ---
app.get('/api/assignments', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, "studentId", "assignmentName", score FROM assignments');
    const mapped = rows.map(r => ({ id: r.id, studentId: r.studentId || r.studentid, assignmentName: r.assignmentName || r.assignmentname, score: r.score }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assignments/bulk', async (req, res) => {
  const newAssignments = req.body;
  const time = Date.now();
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    for (let idx = 0; idx < newAssignments.length; idx++) {
      const assign = newAssignments[idx];
      const { rows } = await client.query('SELECT id FROM assignments WHERE "studentId" = $1 AND LOWER("assignmentName") = LOWER($2)', 
        [assign.studentId, assign.assignmentName]);
      
      if (rows.length > 0) {
        await client.query('UPDATE assignments SET score = $1 WHERE id = $2', [assign.score, rows[0].id]);
      } else {
        const id = (time + idx).toString();
        await client.query('INSERT INTO assignments (id, "studentId", "assignmentName", score) VALUES ($1, $2, $3, $4)', 
          [id, assign.studentId, assign.assignmentName, assign.score]);
      }
    }
    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Bulk insert failed' });
  } finally {
    client.release();
  }
});

// --- TOPICS API ---
app.get('/api/topics', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT date, "topicName" FROM topics');
    const topicsObj = {};
    rows.forEach(r => topicsObj[r.date] = r.topicName || r.topicname);
    res.json(topicsObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/topics', async (req, res) => {
  const { date, topicName } = req.body;
  try {
    const { rows } = await db.query('SELECT date FROM topics WHERE date = $1', [date]);
    if (rows.length > 0) {
      await db.query('UPDATE topics SET "topicName" = $1 WHERE date = $2', [topicName, date]);
    } else {
      await db.query('INSERT INTO topics (date, "topicName") VALUES ($1, $2)', [date, topicName]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
  console.log(\`Server running on port \${PORT}\`);
});
