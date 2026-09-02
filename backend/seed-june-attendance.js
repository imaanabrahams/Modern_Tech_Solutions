import dotenv from "dotenv";
import pool from "./config/db.js";

dotenv.config({ override: true });

const START_DATE = new Date("2025-06-01T00:00:00Z");
const END_DATE = new Date("2025-06-30T00:00:00Z");
const SPECIAL_EMPLOYEES = {
  EMP004: "absent",
  EMP007: "late",
};

function dateValue(date) {
  return date.toISOString().slice(0, 10);
}

async function seedJuneAttendance() {
  const connection = await pool.getConnection();
  try {
    const [employees] = await connection.query(
      "SELECT id, first_name, last_name FROM employees ORDER BY id",
    );
    if (employees.length === 0) {
      throw new Error("No employees found. Run `npm run seed` first.");
    }

    await connection.beginTransaction();

    for (const employee of employees) {
      const employeeName = `${employee.first_name} ${employee.last_name}`;
      for (
        let date = new Date(START_DATE);
        date <= END_DATE;
        date.setUTCDate(date.getUTCDate() + 1)
      ) {
        const dateString = dateValue(date);
        const status =
          dateString === "2025-06-02"
            ? SPECIAL_EMPLOYEES[employee.id] || "present"
            : "present";
        const isPresent = status === "present" || status === "late";
        const checkIn = status === "late" ? "09:32" : isPresent ? "08:55" : "-";
        const checkOut = isPresent ? "17:30" : "-";
        const hoursWorked = status === "late" ? 7.97 : isPresent ? 8.5 : 0;
        const id = `JUN25-${employee.id}-${dateString.slice(-2)}`;

        await connection.query(
          `INSERT INTO attendance
            (id, employee_id, employee_name, date, check_in, check_out, hours_worked, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
            employee_name = VALUES(employee_name), check_in = VALUES(check_in),
            check_out = VALUES(check_out), hours_worked = VALUES(hours_worked),
            status = VALUES(status)`,
          [
            id,
            employee.id,
            employeeName,
            dateString,
            checkIn,
            checkOut,
            hoursWorked,
            status,
          ],
        );
      }
    }

    const leaveEmployee = employees.find((employee) => employee.id === "EMP004");
    if (leaveEmployee) {
      await connection.query(
        `INSERT INTO time_off_requests
          (id, employee_id, employee_name, type, start_date, end_date, days, reason, status, submitted_date)
         VALUES (?, ?, ?, 'annual', '2025-06-02', '2025-06-02', 1, ?, 'approved', '2025-05-28')
         ON DUPLICATE KEY UPDATE
          employee_name = VALUES(employee_name), status = VALUES(status)`,
        [
          "JUN25-TO-EMP004",
          leaveEmployee.id,
          `${leaveEmployee.first_name} ${leaveEmployee.last_name}`,
          "Annual leave on the first Monday of June",
        ],
      );
    }

    await connection.commit();
    console.log(
      `Seeded June 2025 attendance for ${employees.length} employees across 30 days.`,
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seedJuneAttendance().catch((error) => {
  console.error("June attendance seed failed:", error.message);
  process.exitCode = 1;
});