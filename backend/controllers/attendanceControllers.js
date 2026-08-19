import Attendance from "../models/Attendance.js";
import { DEMO_ATTENDANCE, isDbUnavailableError } from "../demoData.js";

const VALID_STATUS = ["present", "absent", "late", "excused"];

function toApi(row) {
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

export const getAllAttendance = async (req, res) => {
  try {
    try {
      const attendance = await Attendance.getAll();
      return res.json(attendance.map(toApi));
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;
      return res.json(DEMO_ATTENDANCE.map(toApi));
    }
  } catch (err) {
    console.error("Get attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAttendanceById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Attendance.findById(id);

    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    res.json(toApi(record));
  } catch (err) {
    console.error("Get attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAttendanceByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.getByEmployeeId(employeeId);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get employee attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAttendanceByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: "startDate and endDate query parameters are required.",
      });
    }

    const records = await Attendance.getByDateRange(startDate, endDate);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get attendance by date range error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createAttendance = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      date,
      checkIn,
      checkOut,
      hoursWorked,
      status,
    } = req.body;

    // Validation
    if (!employeeId || !date) {
      return res
        .status(400)
        .json({ error: "Employee ID and date are required." });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (hoursWorked !== undefined && (isNaN(hoursWorked) || hoursWorked < 0)) {
      return res
        .status(400)
        .json({ error: "Hours worked must be a non-negative number." });
    }

    const id = await Attendance.create({
      employeeId,
      employeeName: employeeName || "Unknown",
      date,
      checkIn: checkIn || "-",
      checkOut: checkOut || "-",
      hoursWorked: hoursWorked || 0,
      status: status || "present",
    });

    const record = await Attendance.findById(id);
    res.status(201).json(toApi(record));
  } catch (err) {
    console.error("Create attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut, hoursWorked, status } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Record ID is required." });
    }

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    // Validation
    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (hoursWorked !== undefined && (isNaN(hoursWorked) || hoursWorked < 0)) {
      return res
        .status(400)
        .json({ error: "Hours worked must be a non-negative number." });
    }

    await Attendance.update(id, {
      checkIn,
      checkOut,
      hoursWorked,
      status,
    });

    const updated = await Attendance.findById(id);
    res.json(toApi(updated));
  } catch (err) {
    console.error("Update attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Attendance.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    await Attendance.delete(id);
    res.json({ message: "Attendance record deleted successfully" });
  } catch (err) {
    console.error("Delete attendance error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByEmployee,
  getAttendanceByDateRange,
  createAttendance,
  updateAttendance,
  deleteAttendance,
};
