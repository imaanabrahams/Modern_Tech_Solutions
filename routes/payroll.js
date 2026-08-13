const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function mapPayroll(row) {
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

router.get("/", (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.month) {
    conditions.push("payroll_records.month = ?");
    params.push(req.query.month);
  }

  if (req.query.year) {
    conditions.push("payroll_records.year = ?");
    params.push(Number(req.query.year));
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      payroll_records.id,
      payroll_records.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      payroll_records.month,
      payroll_records.year,
      payroll_records.base_salary,
      payroll_records.hours_worked,
      payroll_records.overtime_hours,
      payroll_records.bonus,
      payroll_records.deductions,
      payroll_records.net_salary,
      payroll_records.status
    FROM payroll_records
    JOIN employees ON payroll_records.employee_id = employees.id
    ${where}
    ORDER BY payroll_records.year DESC, payroll_records.month DESC, employee_name
  `;

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapPayroll));
});

router.put("/:id/process", (req, res) => {
  const id = req.params.id;
  const current = db
    .prepare("SELECT * FROM payroll_records WHERE id = ?")
    .get(id);
  if (!current) {
    return res.status(404).json({ error: "Payroll record not found." });
  }

  if (current.status !== "pending") {
    const payload = db
      .prepare(
        `
      SELECT
        payroll_records.id,
        payroll_records.employee_id,
        employees.first_name || ' ' || employees.last_name AS employee_name,
        payroll_records.month,
        payroll_records.year,
        payroll_records.base_salary,
        payroll_records.hours_worked,
        payroll_records.overtime_hours,
        payroll_records.bonus,
        payroll_records.deductions,
        payroll_records.net_salary,
        payroll_records.status
      FROM payroll_records
      JOIN employees ON payroll_records.employee_id = employees.id
      WHERE payroll_records.id = ?
    `,
      )
      .get(id);
    return res.json(mapPayroll(payload));
  }

  db.prepare("UPDATE payroll_records SET status = ? WHERE id = ?").run(
    "processed",
    id,
  );
  const updated = db
    .prepare(
      `
    SELECT
      payroll_records.id,
      payroll_records.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      payroll_records.month,
      payroll_records.year,
      payroll_records.base_salary,
      payroll_records.hours_worked,
      payroll_records.overtime_hours,
      payroll_records.bonus,
      payroll_records.deductions,
      payroll_records.net_salary,
      payroll_records.status
    FROM payroll_records
    JOIN employees ON payroll_records.employee_id = employees.id
    WHERE payroll_records.id = ?
  `,
    )
    .get(id);

  res.json(mapPayroll(updated));
});

module.exports = router;
