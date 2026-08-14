// server.js — entry point. Boots Express, wires up the API routes, and
// (for convenience in this prototype) serves the front-end static files
// too, so `npm start` here is the only command you need to run the whole app.

require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy .env.example to .env and set one before starting the server.');
  process.exit(1);
}

// Importing db.js opens the SQLite connection and runs schema + seed.
require('./db');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const attendanceRoutes = require('./routes/attendance');
const payrollRoutes = require('./routes/payroll');
const timeoffRoutes = require('./routes/timeoff');

const app = express();

app.use(cors());
app.use(express.json());

// --- API ---------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/timeoff', timeoffRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// --- Front-end -----------------------------------------------------------
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// --- 404 for unmatched API routes ----------------------------------------
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found.' }));

// --- Central error handler ------------------------------------------------
// Any route that calls next(err), or throws inside an async handler that's
// wrapped, ends up here so every error response has the same JSON shape.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5506;
app.listen(PORT, () => {
  console.log(`HR system backend running at http://localhost:${PORT}`);
});
