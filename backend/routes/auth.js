// routes/auth.js — login issues a JWT; /me lets the frontend recover the
// logged-in user's profile after a page refresh (token already in localStorage).

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  // Same generic error whether the username doesn't exist or the password
  // is wrong — don't leak which one it was.
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const payload = {
    sub: user.id,
    username: user.username,
    fullName: user.full_name,
    role: user.role,
    employeeId: user.employee_id,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  res.json({
    token,
    user: { username: user.username, fullName: user.full_name, role: user.role },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      username: req.user.username,
      fullName: req.user.fullName,
      role: req.user.role,
    },
  });
});

module.exports = router;
