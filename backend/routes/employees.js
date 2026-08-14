// routes/employees.js — CRUD for employees, backing the Employees page.

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const EMAIL_RE = /\S+@\S+\.\S+/;
const VALID_STATUS = ['active', 'on-leave', 'inactive'];
const VALID_EMPLOYMENT_TYPE = ['Full-time', 'Part-time', 'Contract'];

function toApi(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    department: row.department,
    position: row.position,
    hireDate: row.hire_date,
    salary: row.salary,
    employmentType: row.employment_type,
    status: row.status,
    manager: row.manager,
  };
}

function validate(body, { partial = false } = {}) {
  const errors = {};
  const req = (field, label) => {
    if (!partial && !String(body[field] ?? '').trim()) errors[field] = `${label} is required`;
  };

  req('firstName', 'First name');
  req('lastName', 'Last name');
  req('department', 'Department');
  req('position', 'Position');
  req('hireDate', 'Hire date');
  req('phone', 'Phone');

  if (body.email !== undefined || !partial) {
    if (!String(body.email ?? '').trim()) errors.email = 'Email is required';
    else if (!EMAIL_RE.test(body.email)) errors.email = 'Email is invalid';
  }

  if (body.salary !== undefined || !partial) {
    const salary = Number(body.salary);
    if (!Number.isFinite(salary) || salary <= 0) errors.salary = 'Valid salary is required';
  }

  if (body.status !== undefined && !VALID_STATUS.includes(body.status)) {
    errors.status = `Status must be one of: ${VALID_STATUS.join(', ')}`;
  }
  if (body.employmentType !== undefined && !VALID_EMPLOYMENT_TYPE.includes(body.employmentType)) {
    errors.employmentType = `Employment type must be one of: ${VALID_EMPLOYMENT_TYPE.join(', ')}`;
  }

  return errors;
}

function nextEmployeeId() {
  const row = db.prepare(`
    SELECT id FROM employees ORDER BY CAST(SUBSTR(id, 4) AS INTEGER) DESC LIMIT 1
  `).get();
  const nextNum = row ? parseInt(row.id.slice(3), 10) + 1 : 1;
  return `EMP${String(nextNum).padStart(3, '0')}`;
}

// GET /api/employees
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM employees ORDER BY id').all();
  res.json(rows.map(toApi));
});

// POST /api/employees
router.post('/', (req, res) => {
  const errors = validate(req.body);
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

  const id = nextEmployeeId();
  try {
    db.prepare(`
      INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, salary, employment_type, status, manager)
      VALUES (@id, @firstName, @lastName, @email, @phone, @department, @position, @hireDate, @salary, @employmentType, @status, @manager)
    `).run({
      id,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department,
      position: req.body.position,
      hireDate: req.body.hireDate,
      salary: Number(req.body.salary),
      employmentType: req.body.employmentType || 'Full-time',
      status: req.body.status || 'active',
      manager: req.body.manager || null,
    });
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed: employees.email')) {
      return res.status(409).json({ error: 'An employee with this email already exists.' });
    }
    return res.status(500).json({ error: 'Could not create employee.' });
  }

  const created = db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
  res.status(201).json(toApi(created));
});

// PUT /api/employees/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Employee not found.' });

  const errors = validate(req.body, { partial: true });
  if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });

  const merged = {
    firstName: req.body.firstName ?? existing.first_name,
    lastName: req.body.lastName ?? existing.last_name,
    email: req.body.email ?? existing.email,
    phone: req.body.phone ?? existing.phone,
    department: req.body.department ?? existing.department,
    position: req.body.position ?? existing.position,
    hireDate: req.body.hireDate ?? existing.hire_date,
    salary: req.body.salary !== undefined ? Number(req.body.salary) : existing.salary,
    employmentType: req.body.employmentType ?? existing.employment_type,
    status: req.body.status ?? existing.status,
    manager: req.body.manager ?? existing.manager,
  };

  try {
    db.prepare(`
      UPDATE employees SET
        first_name = @firstName, last_name = @lastName, email = @email, phone = @phone,
        department = @department, position = @position, hire_date = @hireDate,
        salary = @salary, employment_type = @employmentType, status = @status, manager = @manager
      WHERE id = @id
    `).run({ ...merged, id: req.params.id });
  } catch (err) {
    if (String(err.message).includes('UNIQUE constraint failed: employees.email')) {
      return res.status(409).json({ error: 'An employee with this email already exists.' });
    }
    return res.status(500).json({ error: 'Could not update employee.' });
  }

  const updated = db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
  res.json(toApi(updated));
});

// DELETE /api/employees/:id
// ON DELETE CASCADE on the FKs means this also removes the employee's
// attendance, payroll, and time-off rows in one atomic operation.
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Employee not found.' });
  res.status(204).send();
});

module.exports = router;
