// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Simple request logger (helps debug "Cannot GET /")
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Serve static assets at /static (matches <img src="/static/logo.png">)
app.use('/static', express.static(path.join(__dirname, 'static')));

// Serve login.html (expects templates/login.html)
app.get('/', (req, res) => {
  const p = path.join(__dirname, 'templates', 'login.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  return res.status(404).send('login.html not found. Put it in templates/login.html');
});

// POST /login — reads users.json (simple password check)
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ status: 'fail', message: 'Fill all fields.' });

  const usersPath = path.join(__dirname, 'users.json');
  if (!fs.existsSync(usersPath)) {
    return res.json({ status: 'error', message: 'users.json not found in project root.' });
  }

  let users;
  try { users = JSON.parse(fs.readFileSync(usersPath)); }
  catch (e) { return res.json({ status: 'error', message: 'users.json parse error' }); }

  const user = users.find(u => u.username === username && u.password === password);
  if (user) return res.json({ status: 'success', message: 'Login successful!', role: user.role || 'student' });
  return res.json({ status: 'fail', message: 'Invalid credentials.' });
});

// Serve home.html after successful login
app.get('/home', (req, res) => {
  const p = path.join(__dirname, 'templates', 'home.html');
  if (fs.existsSync(p)) return res.sendFile(p);
  return res.send('<h1>Home</h1><p>Put templates/home.html to replace this.</p>');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
