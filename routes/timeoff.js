const express = require("express");
const { randomUUID } = require("crypto");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

function mapTimeOff(row) {
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

router.get("/", (req, res) => {
  const conditions = [];
  const params = [];

  if (req.query.status && req.query.status !== "all") {
    conditions.push("time_off_requests.status = ?");
    params.push(req.query.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const sql = `
    SELECT
      time_off_requests.id,
      time_off_requests.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      time_off_requests.type,
      time_off_requests.start_date,
      time_off_requests.end_date,
      time_off_requests.days,
      time_off_requests.reason,
      time_off_requests.status,
      time_off_requests.submitted_date
    FROM time_off_requests
    JOIN employees ON time_off_requests.employee_id = employees.id
    ${where}
    ORDER BY time_off_requests.submitted_date DESC
  `;

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(mapTimeOff));
});

router.post("/", (req, res) => {
  const values = req.body || {};
  const errors = {};
  if (!values.employeeId) errors.employeeId = "Employee required";
  if (!values.type) errors.type = "Leave type required";
  if (!values.startDate) errors.startDate = "Start date required";
  if (!values.endDate) errors.endDate = "End date required";
  if (!values.reason?.trim()) errors.reason = "Reason required";
  if (
    values.startDate &&
    values.endDate &&
    new Date(values.endDate) < new Date(values.startDate)
  ) {
    errors.endDate = "End date must be after start date";
  }
  if (Object.keys(errors).length > 0) {
    return res
      .status(400)
      .json({ error: "Validation failed.", fields: errors });
  }

  const id = randomUUID();
  const days =
    Math.ceil(
      (new Date(values.endDate).getTime() -
        new Date(values.startDate).getTime()) /
        86400000,
    ) + 1;
  const stmt = db.prepare(`
    INSERT INTO time_off_requests (id, employee_id, type, start_date, end_date, days, reason, status, submitted_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))
  `);
  stmt.run(
    id,
    values.employeeId,
    values.type,
    values.startDate,
    values.endDate,
    days,
    values.reason,
  );
  const created = db
    .prepare(
      `
    SELECT
      time_off_requests.id,
      time_off_requests.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      time_off_requests.type,
      time_off_requests.start_date,
      time_off_requests.end_date,
      time_off_requests.days,
      time_off_requests.reason,
      time_off_requests.status,
      time_off_requests.submitted_date
    FROM time_off_requests
    JOIN employees ON time_off_requests.employee_id = employees.id
    WHERE time_off_requests.id = ?
  `,
    )
    .get(id);

  res.status(201).json(mapTimeOff(created));
});

router.put("/:id/approve", (req, res) => {
  const id = req.params.id;
  const result = db
    .prepare("UPDATE time_off_requests SET status = ? WHERE id = ?")
    .run("approved", id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Leave request not found." });
  }
  const updated = db
    .prepare(
      `
    SELECT
      time_off_requests.id,
      time_off_requests.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      time_off_requests.type,
      time_off_requests.start_date,
      time_off_requests.end_date,
      time_off_requests.days,
      time_off_requests.reason,
      time_off_requests.status,
      time_off_requests.submitted_date
    FROM time_off_requests
    JOIN employees ON time_off_requests.employee_id = employees.id
    WHERE time_off_requests.id = ?
  `,
    )
    .get(id);
  res.json(mapTimeOff(updated));
});

router.put("/:id/reject", (req, res) => {
  const id = req.params.id;
  const result = db
    .prepare("UPDATE time_off_requests SET status = ? WHERE id = ?")
    .run("rejected", id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "Leave request not found." });
  }
  const updated = db
    .prepare(
      `
    SELECT
      time_off_requests.id,
      time_off_requests.employee_id,
      employees.first_name || ' ' || employees.last_name AS employee_name,
      time_off_requests.type,
      time_off_requests.start_date,
      time_off_requests.end_date,
      time_off_requests.days,
      time_off_requests.reason,
      time_off_requests.status,
      time_off_requests.submitted_date
    FROM time_off_requests
    JOIN employees ON time_off_requests.employee_id = employees.id
    WHERE time_off_requests.id = ?
  `,
    )
    .get(id);
  res.json(mapTimeOff(updated));
});

module.exports = router;
