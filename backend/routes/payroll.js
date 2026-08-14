// routes/payroll.js — payroll list + the "process payroll" action used by
// the Payroll page's PROCESS button.

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
    month: row.month,
    year: row.year,
    baseSalary: row.base_salary,
    hoursWorked: row.hours_worked,
    overtimeHours: row.overtime_hours,
    bonus: row.bonus,
    deductions: row.deductions,
    netSalary: row.net_salary,
    status: row.status,
  };
}

const SELECT = `
  SELECT p.*, (e.first_name || ' ' || e.last_name) AS employee_name
  FROM payroll_records p
  JOIN employees e ON e.id = p.employee_id
`;

// GET /api/payroll?month=July&year=2025
router.get('/', (req, res) => {
  const clauses = [];
  const params = {};
  if (req.query.month) { clauses.push('p.month = @month'); params.month = req.query.month; }
  if (req.query.year) { clauses.push('p.year = @year'); params.year = Number(req.query.year); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';

  const rows = db.prepare(`${SELECT} ${where} ORDER BY employee_name`).all(params);
  res.json(rows.map(toApi));
});

// PUT /api/payroll/:id/process  — pending/processed -> processed, idempotent
router.put('/:id/process', (req, res) => {
  const existing = db.prepare('SELECT * FROM payroll_records WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Payroll record not found.' });

  db.prepare(`UPDATE payroll_records SET status = 'processed' WHERE id = ?`).run(req.params.id);
  const row = db.prepare(`${SELECT} WHERE p.id = ?`).get(req.params.id);
  res.json(toApi(row));
});

module.exports = router;
