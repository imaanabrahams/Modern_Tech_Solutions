import Payroll from "../models/Payroll.js";
import { DEMO_PAYROLL, isDbUnavailableError } from "../demoData.js";

const VALID_STATUS = ["pending", "processing", "paid", "rejected"];

function toApi(row) {
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

export const getAllPayroll = async (req, res) => {
  try {
    try {
      const records = await Payroll.getAll();
      return res.json(records.map(toApi));
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;
      return res.json(DEMO_PAYROLL.map(toApi));
    }
  } catch (err) {
    console.error("Get payroll error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await Payroll.findById(id);

    if (!record) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    res.json(toApi(record));
  } catch (err) {
    console.error("Get payroll error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayrollByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Payroll.getByEmployeeId(employeeId);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get employee payroll error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPayrollByMonthYear = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res
        .status(400)
        .json({ error: "month and year query parameters are required." });
    }

    const records = await Payroll.getByMonthYear(month, year);
    res.json(records.map(toApi));
  } catch (err) {
    console.error("Get payroll by month/year error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createPayroll = async (req, res) => {
  try {
    const {
      employeeId,
      employeeName,
      month,
      year,
      baseSalary,
      hoursWorked,
      overtimeHours,
      bonus,
      deductions,
      netSalary,
      status,
    } = req.body;

    // Validation
    if (!employeeId || !month || !year) {
      return res
        .status(400)
        .json({ error: "Employee ID, month, and year are required." });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    // Validate numeric fields
    const numericFields = {
      baseSalary,
      hoursWorked,
      overtimeHours,
      bonus,
      deductions,
      netSalary,
    };
    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined && (isNaN(value) || value < 0)) {
        return res
          .status(400)
          .json({ error: `${key} must be a non-negative number.` });
      }
    }

    const id = await Payroll.create({
      employeeId,
      employeeName: employeeName || "Unknown",
      month,
      year,
      baseSalary: baseSalary || 0,
      hoursWorked: hoursWorked || 0,
      overtimeHours: overtimeHours || 0,
      bonus: bonus || 0,
      deductions: deductions || 0,
      netSalary: netSalary || 0,
      status: status || "pending",
    });

    const record = await Payroll.findById(id);
    res.status(201).json(toApi(record));
  } catch (err) {
    console.error("Create payroll error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updatePayroll = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      baseSalary,
      hoursWorked,
      overtimeHours,
      bonus,
      deductions,
      netSalary,
      status,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Record ID is required." });
    }

    const record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    // Validation
    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    const numericFields = {
      baseSalary,
      hoursWorked,
      overtimeHours,
      bonus,
      deductions,
      netSalary,
    };
    for (const [key, value] of Object.entries(numericFields)) {
      if (value !== undefined && (isNaN(value) || value < 0)) {
        return res
          .status(400)
          .json({ error: `${key} must be a non-negative number.` });
      }
    }

    await Payroll.update(id, {
      baseSalary,
      hoursWorked,
      overtimeHours,
      bonus,
      deductions,
      netSalary,
      status,
    });

    const updated = await Payroll.findById(id);
    res.json(toApi(updated));
  } catch (err) {
    console.error("Update payroll error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePayroll = async (req, res) => {
  try {
    const { id } = req.params;

    const record = await Payroll.findById(id);
    if (!record) {
      return res.status(404).json({ error: "Payroll record not found" });
    }

    await Payroll.delete(id);
    res.json({ message: "Payroll record deleted successfully" });
  } catch (err) {
    console.error("Delete payroll error:", err);
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
  getAllPayroll,
  getPayrollById,
  getPayrollByEmployee,
  getPayrollByMonthYear,
  createPayroll,
  updatePayroll,
  deletePayroll,
};
