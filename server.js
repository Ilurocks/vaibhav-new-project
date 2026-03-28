const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'enquiries.db');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-123';
const SESSION_COOKIE = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;
const sessions = new Map();
function isAllowedDevOrigin(origin) {
  if (!origin || origin === 'null') return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(origin);
}

fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS enquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const insertEnquiry = db.prepare(`
  INSERT INTO enquiries (full_name, phone_number, email)
  VALUES (@full_name, @phone_number, @email)
`);

const selectEnquiries = db.prepare(`
  SELECT id, full_name, phone_number, email, created_at
  FROM enquiries
  ORDER BY id DESC
`);

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  return cookieHeader.split(';').reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('='));
    return cookies;
  }, {});
}

function safeCompare(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function createSession() {
  const token = crypto.randomBytes(24).toString('hex');
  sessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL_MS
  });
  return token;
}

function clearExpiredSessions() {
  const now = Date.now();
  sessions.forEach((session, token) => {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  });
}

function getSession(req) {
  clearExpiredSessions();
  const cookies = parseCookies(req);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { token, session };
}

function requireAdmin(req, res, next) {
  const activeSession = getSession(req);
  if (!activeSession) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized'
    });
  }
  next();
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (isAllowedDevOrigin(origin)) {
    if (origin) {
      // For credentialed CORS requests, ACAO must be an explicit origin (including "null").
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.static(__dirname));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/api/admin/session', (req, res) => {
  const activeSession = getSession(req);
  return res.json({
    ok: true,
    authenticated: Boolean(activeSession)
  });
});

app.post('/api/admin/login', (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');

  if (!safeCompare(username, ADMIN_USERNAME) || !safeCompare(password, ADMIN_PASSWORD)) {
    return res.status(401).json({
      ok: false,
      message: 'Invalid username or password.'
    });
  }

  const token = createSession();
  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`);

  return res.json({
    ok: true,
    message: 'Login successful.'
  });
});

app.post('/api/admin/logout', (req, res) => {
  const activeSession = getSession(req);
  if (activeSession) {
    sessions.delete(activeSession.token);
  }

  res.setHeader('Set-Cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
  return res.json({
    ok: true
  });
});

app.post('/api/enquiries', (req, res) => {
  const fullName = String(req.body.fullName || '').trim();
  const phone = String(req.body.phone || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!fullName || !phone || !email) {
    return res.status(400).json({
      ok: false,
      message: 'All fields are required.'
    });
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({
      ok: false,
      message: 'Please enter a valid email address.'
    });
  }

  const phonePattern = /^[0-9]{10,15}$/;
  const normalizedPhone = phone.replace(/\D/g, '');
  if (!phonePattern.test(normalizedPhone)) {
    return res.status(400).json({
      ok: false,
      message: 'Please enter a valid phone number.'
    });
  }

  try {
    const result = insertEnquiry.run({
      full_name: fullName,
      phone_number: normalizedPhone,
      email
    });

    return res.status(201).json({
      ok: true,
      message: 'Enquiry submitted successfully.',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Failed to save enquiry:', error);
    return res.status(500).json({
      ok: false,
      message: 'Unable to save enquiry right now.'
    });
  }
});

app.get('/api/enquiries', requireAdmin, (req, res) => {
  try {
    const enquiries = selectEnquiries.all();
    return res.json({
      ok: true,
      enquiries
    });
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
    return res.status(500).json({
      ok: false,
      message: 'Unable to load enquiries right now.'
    });
  }
});

app.get('/admin', (req, res) => {
  if (!getSession(req)) {
    return res.redirect('/login');
  }
  res.sendFile(path.join(__dirname, 'admin.html'));
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`SQLite database: ${DB_PATH}`);
});
