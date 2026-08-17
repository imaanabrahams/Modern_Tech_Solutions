// db.js — SQLite connection, schema (3NF) creation, and first-run seeding.
//
// We use better-sqlite3 because it is synchronous (no callback/promise
// juggling needed for a project this size) and has zero external server
// to install — the whole database lives in one file on disk.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'hr_system.db');
const db = new Database(DB_FILE);

// Enforce referential integrity (FK constraints are OFF by default in SQLite)
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// ---------------------------------------------------------------------------
// Schema — normalised to 3NF:
//   employees is the single source of truth for employee data.
//   attendance_records / payroll_records / time_off_requests only store the
//   employeeId foreign key — employeeName is looked up via JOIN, never
//   duplicated, so a name change only ever has to happen in one place.
// ---------------------------------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id               TEXT PRIMARY KEY,
    first_name       TEXT NOT NULL,
    last_name        TEXT NOT NULL,
    email            TEXT NOT NULL UNIQUE,
    phone            TEXT,
    department       TEXT NOT NULL,
    position         TEXT NOT NULL,
    hire_date        TEXT NOT NULL,
    salary           REAL NOT NULL CHECK (salary > 0),
    employment_type  TEXT NOT NULL DEFAULT 'Full-time',
    status           TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'on-leave', 'inactive')),
    manager          TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    role            TEXT NOT NULL DEFAULT 'HR Staff',
    employee_id     TEXT REFERENCES employees(id) ON DELETE SET NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS attendance_records (
    id             TEXT PRIMARY KEY,
    employee_id    TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date           TEXT NOT NULL,
    check_in       TEXT,
    check_out      TEXT,
    hours_worked   REAL NOT NULL DEFAULT 0,
    status         TEXT NOT NULL DEFAULT 'present'
                      CHECK (status IN ('present', 'absent', 'late', 'half-day')),
    UNIQUE (employee_id, date)
  );

  CREATE TABLE IF NOT EXISTS payroll_records (
    id              TEXT PRIMARY KEY,
    employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month           TEXT NOT NULL,
    year            INTEGER NOT NULL,
    base_salary     REAL NOT NULL,
    hours_worked    REAL NOT NULL DEFAULT 0,
    overtime_hours  REAL NOT NULL DEFAULT 0,
    bonus           REAL NOT NULL DEFAULT 0,
    deductions      REAL NOT NULL DEFAULT 0,
    net_salary      REAL NOT NULL,
    status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processed', 'paid')),
    UNIQUE (employee_id, month, year)
  );

  CREATE TABLE IF NOT EXISTS time_off_requests (
    id              TEXT PRIMARY KEY,
    employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'other')),
    start_date      TEXT NOT NULL,
    end_date        TEXT NOT NULL,
    days            INTEGER NOT NULL,
    reason          TEXT,
    status          TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
    submitted_date  TEXT NOT NULL
  );

  -- Indexes for the lookups the app actually does (filter/join by employee,
  -- filter by status, filter payroll by month+year).
  CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_attendance_date      ON attendance_records(date);
  CREATE INDEX IF NOT EXISTS idx_payroll_employee     ON payroll_records(employee_id);
  CREATE INDEX IF NOT EXISTS idx_payroll_period       ON payroll_records(year, month);
  CREATE INDEX IF NOT EXISTS idx_timeoff_employee     ON time_off_requests(employee_id);
  CREATE INDEX IF NOT EXISTS idx_timeoff_status       ON time_off_requests(status);

  -- Bonus requirement: trigger to keep updated_at current automatically
  -- any time an employee row is modified.
  CREATE TRIGGER IF NOT EXISTS trg_employees_updated_at
  AFTER UPDATE ON employees
  BEGIN
    UPDATE employees SET updated_at = datetime('now') WHERE id = NEW.id;
  END;
`);

// ---------------------------------------------------------------------------
// One-time seed: only runs if the employees table is empty, so it's safe to
// leave in place — restarting the server never duplicates or wipes data.
// ---------------------------------------------------------------------------
function seed() {
  const employeeCount = db.prepare('SELECT COUNT(*) AS n FROM employees').get().n;
  if (employeeCount > 0) {
    console.log('Database already has data — skipping seed.');
    return;
  }

  console.log('Seeding database from ./seed/*.json ...');
  const seedDir = path.join(__dirname, 'seed');
  const readJSON = (file) => JSON.parse(fs.readFileSync(path.join(seedDir, file), 'utf8'));

  const employees = readJSON('employees.json');
  const attendance = readJSON('attendance-records.json');
  const payroll = readJSON('payroll-records.json');
  const timeOff = readJSON('time-off-requests.json');
  const demoUser = readJSON('user.json');

  const bcrypt = require('bcryptjs');

  // Wrap the whole seed in a single transaction (bonus requirement:
  // database transactions for critical/multi-step operations) so a failure
  // partway through leaves the database untouched rather than half-seeded.
  const runSeed = db.transaction(() => {
    const insertEmployee = db.prepare(`
      INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, salary, employment_type, status)
      VALUES (@id, @firstName, @lastName, @email, @phone, @department, @position, @hireDate, @salary, @employmentType, @status)
    `);
    employees.forEach((e) => insertEmployee.run(e));

    const insertAttendance = db.prepare(`
      INSERT INTO attendance_records (id, employee_id, date, check_in, check_out, hours_worked, status)
      VALUES (@id, @employeeId, @date, @checkIn, @checkOut, @hoursWorked, @status)
    `);
    attendance.forEach((a) => insertAttendance.run(a));

    const insertPayroll = db.prepare(`
      INSERT INTO payroll_records (id, employee_id, month, year, base_salary, hours_worked, overtime_hours, bonus, deductions, net_salary, status)
      VALUES (@id, @employeeId, @month, @year, @baseSalary, @hoursWorked, @overtimeHours, @bonus, @deductions, @netSalary, @status)
    `);
    payroll.forEach((p) => insertPayroll.run(p));

    const insertTimeOff = db.prepare(`
      INSERT INTO time_off_requests (id, employee_id, type, start_date, end_date, days, reason, status, submitted_date)
      VALUES (@id, @employeeId, @type, @startDate, @endDate, @days, @reason, @status, @submittedDate)
    `);
    timeOff.forEach((t) => insertTimeOff.run(t));

    // Demo login user — password is hashed with bcrypt before it ever
    // touches disk. The plaintext "admin123" from the original user.json
    // fixture only exists in-memory for this one hashing step.
    const passwordHash = bcrypt.hashSync(demoUser.password, 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, employee_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(demoUser.username, passwordHash, demoUser.fullName, demoUser.role, 'EMP002');
  });

  runSeed();
  console.log(`Seeded ${employees.length} employees, ${attendance.length} attendance records, ${payroll.length} payroll records, ${timeOff.length} time-off requests, 1 user.`);
}

seed();

// Allow `npm run seed` to just seed and exit without booting the server.
if (require.main === module && process.argv.includes('--seed-only')) {
  process.exit(0);
}

module.exports = db;
