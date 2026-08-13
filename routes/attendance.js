const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function mapAttendance(row) {
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

router.get("/", (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.date) {
    conditions.push("attendance_records.date = ?");
    params.push(req.query.date);
  }

  if (req.query.status) {
    conditions.push("attendance_records.status = ?");
    params.push(req.query.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      attendance_records.id,
      attendance_records.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      attendance_records.date,
      attendance_records.check_in,
      attendance_records.check_out,
      attendance_records.hours_worked,
      attendance_records.status
    FROM attendance_records
    JOIN employees ON attendance_records.employee_id = employees.id
    ${where}
    ORDER BY attendance_records.date DESC, employee_name
  `;

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapAttendance));
});

module.exports = router;
