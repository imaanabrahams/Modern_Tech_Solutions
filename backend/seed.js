// seed.js — loads the fixtures in ./seed/*.json into MySQL.
//
// Run `npm run db:setup` first (or execute database-setup.sql yourself) to
// create the database and tables, then run `npm run seed` to populate them.
// Safe to re-run: it skips seeding if the employees table already has rows.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcryptjs from "bcryptjs";
import pool from "./config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
function dirname(p) {
  return path.dirname(p);
}

const seedDir = path.join(__dirname, "seed");
const readJSON = (file) =>
  JSON.parse(fs.readFileSync(path.join(seedDir, file), "utf8"));

async function seed() {
  const connection = await pool.getConnection();
  try {
    const [existing] = await connection.query(
      "SELECT COUNT(*) AS n FROM employees",
    );
    if (existing[0].n > 0) {
      console.log("employees table already has data — skipping seed.");
      return;
    }

    const employees = readJSON("employees.json");
    const attendance = readJSON("attendance-records.json");
    const payroll = readJSON("payroll-records.json");
    const timeOff = readJSON("time-off-requests.json");
    const demoUser = readJSON("user.json");

    await connection.beginTransaction();

    for (const e of employees) {
      await connection.query(
        `INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, salary, employment_type, status, manager)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          e.id,
          e.firstName,
          e.lastName,
          e.email,
          e.phone || null,
          e.department || null,
          e.position || null,
          e.hireDate || null,
          e.salary || 0,
          e.employmentType || "Full-time",
          e.status || "active",
          e.manager || null,
        ],
      );
    }

    for (const a of attendance) {
      await connection.query(
        `INSERT INTO attendance (id, employee_id, employee_name, date, check_in, check_out, hours_worked, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.employeeId,
          a.employeeName,
          a.date,
          a.checkIn || "-",
          a.checkOut || "-",
          a.hoursWorked || 0,
          a.status || "present",
        ],
      );
    }

    for (const p of payroll) {
      await connection.query(
        `INSERT INTO payroll (id, employee_id, employee_name, month, year, base_salary, hours_worked, overtime_hours, bonus, deductions, net_salary, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.employeeId,
          p.employeeName,
          p.month,
          p.year,
          p.baseSalary || 0,
          p.hoursWorked || 0,
          p.overtimeHours || 0,
          p.bonus || 0,
          p.deductions || 0,
          p.netSalary || 0,
          p.status || "pending",
        ],
      );
    }

    for (const t of timeOff) {
      await connection.query(
        `INSERT INTO time_off_requests (id, employee_id, employee_name, type, start_date, end_date, days, reason, status, submitted_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          t.id,
          t.employeeId,
          t.employeeName,
          t.type,
          t.startDate,
          t.endDate,
          t.days || 1,
          t.reason || "",
          t.status || "pending",
          t.submittedDate || new Date().toISOString().split("T")[0],
        ],
      );
    }

    const passwordHash = bcryptjs.hashSync(demoUser.password, 10);
    await connection.query(
      `INSERT INTO users (username, password_hash, full_name, role, employee_id)
       VALUES (?, ?, ?, ?, ?)`,
      [demoUser.username, passwordHash, demoUser.fullName, demoUser.role, "EMP002"],
    );

    await connection.commit();
    console.log(
      `Seeded ${employees.length} employees, ${attendance.length} attendance records, ${payroll.length} payroll records, ${timeOff.length} time-off requests, 1 user.`,
    );
  } catch (err) {
    await connection.rollback();
    console.error("Seed failed, rolled back:", err.message);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
