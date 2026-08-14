// routes/attendance.js — read-only feed for the Attendance page.
// (Attendance is populated by seed data / a time clock system in this
// prototype; see README "what to extend" for a real check-in endpoint.)

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function toApi(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    hoursWorked: row.hours_worked,
    status: row.status,
  };
}

// GET /api/attendance?date=YYYY-MM-DD&status=present
router.get('/', (req, res) => {
  const clauses = [];
  const params = {};

  if (req.query.date) { clauses.push('a.date = @date'); params.date = req.query.date; }
  if (req.query.status && req.query.status !== 'all') { clauses.push('a.status = @status'); params.status = req.query.status; }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT a.*, (e.first_name || ' ' || e.last_name) AS employee_name
    FROM attendance_records a
    JOIN employees e ON e.id = a.employee_id
    ${where}
    ORDER BY a.date DESC, employee_name
  `).all(params);

  res.json(rows.map(toApi));
});

module.exports = router;
