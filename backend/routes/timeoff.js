// routes/timeoff.js — time-off requests: list, submit new, approve/reject.

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_TYPES = ['vacation', 'sick', 'personal', 'other'];

function toApi(row) {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    days: row.days,
    reason: row.reason,
    status: row.status,
    submittedDate: row.submitted_date,
  };
}

const SELECT = `
  SELECT t.*, (e.first_name || ' ' || e.last_name) AS employee_name
  FROM time_off_requests t
  JOIN employees e ON e.id = t.employee_id
`;

function calcDays(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

function nextRequestId() {
  const row = db.prepare(`
    SELECT id FROM time_off_requests ORDER BY CAST(SUBSTR(id, 3) AS INTEGER) DESC LIMIT 1
  `).get();
  const nextNum = row ? parseInt(row.id.slice(2), 10) + 1 : 1;
  return `TO${String(nextNum).padStart(3, '0')}`;
}

// GET /api/timeoff?status=pending
router.get('/', (req, res) => {
  const clauses = [];
  const params = {};
  if (req.query.status && req.query.status !== 'all') {
    clauses.push('t.status = @status');
    params.status = req.query.status;
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = db.prepare(`${SELECT} ${where} ORDER BY t.submitted_date DESC`).all(params);
  res.json(rows.map(toApi));
});

// POST /api/timeoff
router.post('/', (req, res) => {
  const { employeeId, type, startDate, endDate, reason } = req.body || {};
  const errors = {};

  if (!employeeId) errors.employeeId = 'Employee is required';
  else if (!db.prepare('SELECT 1 FROM employees WHERE id = ?').get(employeeId)) errors.employeeId = 'Unknown employee';
  if (!type || !VALID_TYPES.includes(type)) errors.type = `Type must be one of: ${VALID_TYPES.join(', ')}`;
  if (!startDate) errors.startDate = 'Start date is required';
  if (!endDate) errors.endDate = 'End date is required';
  if (startDate && endDate && new Date(endDate) < new Date(startDate)) errors.endDate = 'End date must be after start date';
  if (!reason || !reason.trim()) errors.reason = 'Reason is required';

  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

  const id = nextRequestId();
  db.prepare(`
    INSERT INTO time_off_requests (id, employee_id, type, start_date, end_date, days, reason, status, submitted_date)
    VALUES (@id, @employeeId, @type, @startDate, @endDate, @days, @reason, 'pending', @submittedDate)
  `).run({
    id,
    employeeId,
    type,
    startDate,
    endDate,
    days: calcDays(startDate, endDate),
    reason,
    submittedDate: new Date().toISOString().split('T')[0],
  });

  const row = db.prepare(`${SELECT} WHERE t.id = ?`).get(id);
  res.status(201).json(toApi(row));
});

function setStatus(status) {
  return (req, res) => {
    const existing = db.prepare('SELECT * FROM time_off_requests WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Time-off request not found.' });

    db.prepare('UPDATE time_off_requests SET status = ? WHERE id = ?').run(status, req.params.id);
    const row = db.prepare(`${SELECT} WHERE t.id = ?`).get(req.params.id);
    res.json(toApi(row));
  };
}

// PUT /api/timeoff/:id/approve
router.put('/:id/approve', setStatus('approved'));
// PUT /api/timeoff/:id/reject
router.put('/:id/reject', setStatus('rejected'));

module.exports = router;
