const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = 'davao-secret';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./db.sqlite');
db.serialize(() => {
  db.run(\`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  )\`);
  db.run(\`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    type TEXT,
    amount REAL,
    status TEXT,
    created_at TEXT
  )\`);
});

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'user'], (err) => {
    if (err) return res.status(400).json({ error: 'User already exists' });
    res.json({ message: 'Registered successfully' });
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET);
    res.json({ token });
  });
});

function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(403).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
}

app.post('/api/deposit', authenticate, (req, res) => {
  const { amount } = req.body;
  db.run('INSERT INTO transactions (user_id, type, amount, status, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
    [req.user.id, 'deposit', amount, 'pending'],
    () => res.json({ message: 'Deposit requested' })
  );
});

app.post('/api/withdraw', authenticate, (req, res) => {
  const { amount } = req.body;
  db.run('INSERT INTO transactions (user_id, type, amount, status, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
    [req.user.id, 'withdraw', amount, 'pending'],
    () => res.json({ message: 'Withdraw requested' })
  );
});

app.get('/api/admin/transactions', authenticate, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Access denied' });
  db.all('SELECT * FROM transactions', [], (err, rows) => {
    res.json(rows);
  });
});

app.listen(PORT, () => console.log(\`Server running on http://localhost:\${PORT}\`));