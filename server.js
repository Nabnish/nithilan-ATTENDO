// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Simple request logger to help debug
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Serve static files at /static (so <img src="/static/logo.png"> works)
app.use('/static', express.static(path.join(__dirname, 'static')));

// Root: serve templates/login.html
app.get('/', (req, res) => {
  const file = path.join(__dirname, 'templates', 'login.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  return res.status(404).send('login.html not found. Put it in templates/login.html');
});

// POST /login - read users.json and check username/password
app.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ status: 'fail', message: 'Fill all fields.' });

  const usersPath = path.join(__dirname, 'users.json');
  if (!fs.existsSync(usersPath)) return res.json({ status: 'error', message: 'users.json missing.' });

  let users;
  try {
    users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
  } catch (err) {
    console.error('users.json parse error', err);
    return res.json({ status: 'error', message: 'users.json parse error' });
  }

  const user = users.find(u => u.username === username && u.password === password);
  if (user) return res.json({ status: 'success', message: 'Login successful!', role: user.role || 'student' });

  return res.json({ status: 'fail', message: 'Invalid credentials.' });
});

// /home page (simple)
app.get('/home', (req, res) => {
  const file = path.join(__dirname, 'templates', 'home.html');
  if (fs.existsSync(file)) return res.sendFile(file);
  return res.send('<h1>Home</h1><p>Create templates/home.html to replace this.</p>');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
