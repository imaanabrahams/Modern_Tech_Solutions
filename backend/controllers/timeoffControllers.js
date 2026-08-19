import TimeOff from "../models/TimeOff.js";
import { DEMO_TIMEOFF, isDbUnavailableError } from "../demoData.js";

const VALID_TYPES = [
  "annual",
  "sick",
  "personal",
  "unpaid",
  "maternity",
  "paternity",
];
const VALID_STATUS = ["pending", "approved", "rejected"];

function toApi(row) {
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

export const getAllTimeOff = async (req, res) => {
  try {
    try {
      const records = await TimeOff.getAll();
      return res.json(records.map(toApi));
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;
      return res.json(DEMO_TIMEOFF.map(toApi));
    }
  } catch (err) {
    console.error("Get time off error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTimeOffById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await TimeOff.findById(id);

    if (!record) {
      return res.status(404).json({ error: "Time off request not found" });
    }

    res.json(toApi(record));
  } catch (err) {
    console.error("Get time off error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTimeOffByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await TimeOff.getByEmployeeId(employeeId);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get employee time off error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTimeOffByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status) {
      return res
        .status(400)
        .json({ error: "status query parameter is required." });
    }

    if (!VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    const records = await TimeOff.getByStatus(status);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get time off by status error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTimeOff = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      type,
      startDate,
      endDate,
      days,
      reason,
      status,
      submittedDate,
    } = req.body;

    // Validation
    if (!employeeId || !type || !startDate || !endDate) {
      return res.status(400).json({
        error: "Employee ID, type, start date, and end date are required.",
      });
    }

    if (!VALID_TYPES.includes(type)) {
      return res
        .status(400)
        .json({ error: `Type must be one of: ${VALID_TYPES.join(", ")}` });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (days !== undefined && (isNaN(days) || days <= 0)) {
      return res.status(400).json({ error: "Days must be a positive number." });
    }

    const id = await TimeOff.create({
      employeeId,
      employeeName: employeeName || "Unknown",
      type,
      startDate,
      endDate,
      days: days || 1,
      reason: reason || "",
      status: status || "pending",
      submittedDate: submittedDate || new Date().toISOString().split("T")[0],
    });

    const record = await TimeOff.findById(id);
    res.status(201).json(toApi(record));
  } catch (err) {
    console.error("Create time off error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateTimeOff = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, days } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Request ID is required." });
    }

    const record = await TimeOff.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Time off request not found" });
    }

    // Validation
    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (days !== undefined && (isNaN(days) || days <= 0)) {
      return res.status(400).json({ error: "Days must be a positive number." });
    }

    await TimeOff.update(id, {
      status,
      reason,
      days,
    });

    const updated = await TimeOff.findById(id);
    res.json(toApi(updated));
  } catch (err) {
    console.error("Update time off error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteTimeOff = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await TimeOff.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Time off request not found" });
    }

    await TimeOff.delete(id);
    res.json({ message: "Time off request deleted successfully" });
  } catch (err) {
    console.error("Delete time off error:", err);
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
  getAllTimeOff,
  getTimeOffById,
  getTimeOffByEmployee,
  getTimeOffByStatus,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff,
};
