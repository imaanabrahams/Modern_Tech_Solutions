const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function mapEmployee(row) {
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function validateEmployee(values) {
  const errors = {};
  if (!values.firstName?.trim()) errors.firstName = "First name is required";
  if (!values.lastName?.trim()) errors.lastName = "Last name is required";
  if (!values.email?.trim()) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(values.email))
    errors.email = "Email is invalid";
  if (!values.phone?.trim()) errors.phone = "Phone is required";
  if (!values.department?.trim()) errors.department = "Department is required";
  if (!values.position?.trim()) errors.position = "Position is required";
  if (!values.hireDate) errors.hireDate = "Hire date is required";
  if (
    values.salary === undefined ||
    values.salary === null ||
    Number(values.salary) <= 0
  )
    errors.salary = "Valid salary is required";
  return errors;
}

router.get("/", (req, res) => {
  const rows = db
    .prepare("SELECT * FROM employees ORDER BY last_name, first_name")
    .all();
  res.json(rows.map(mapEmployee));
});

router.post("/", (req, res) => {
  const values = req.body || {};
  const errors = validateEmployee(values);
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  const id = `EMP${randomUUID().slice(0, 8).toUpperCase()}`;
  const stmt = db.prepare(`
    INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, salary, employment_type, status, manager)
    VALUES (@id, @firstName, @lastName, @email, @phone, @department, @position, @hireDate, @salary, @employmentType, @status, @manager)
  `);

  try {
    stmt.run({
      id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      department: values.department,
      position: values.position,
      hireDate: values.hireDate,
      salary: Number(values.salary),
      employmentType: values.employmentType || "Full-time",
      status: values.status || "active",
      manager: values.manager || null,
    });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res
        .status(409)
        .json({
          error: "Email already exists.",
          fields: { email: "Email already exists." },
        });
    }
    throw err;
  }

  const created = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  res.status(201).json(mapEmployee(created));
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const values = req.body || {};
  const errors = validateEmployee(values);
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  const stmt = db.prepare(`
    UPDATE employees
    SET first_name = @firstName,
        last_name = @lastName,
        email = @email,
        phone = @phone,
        department = @department,
        position = @position,
        hire_date = @hireDate,
        salary = @salary,
        employment_type = @employmentType,
        status = @status,
        manager = @manager
    WHERE id = @id
  `);

  try {
    const result = stmt.run({
      id,
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      department: values.department,
      position: values.position,
      hireDate: values.hireDate,
      salary: Number(values.salary),
      employmentType: values.employmentType || "Full-time",
      status: values.status || "active",
      manager: values.manager || null,
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res
        .status(409)
        .json({
          error: "Email already exists.",
          fields: { email: "Email already exists." },
        });
    }
    throw err;
  }

  const updated = db.prepare("SELECT * FROM employees WHERE id = ?").get(id);
  res.json(mapEmployee(updated));
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  const result = db.prepare("DELETE FROM employees WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Employee not found." });
  }
  res.json({ success: true });
});

module.exports = router;
