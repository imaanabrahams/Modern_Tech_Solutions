import Employee from "../models/Employee.js";
import { DEMO_EMPLOYEES, isDbUnavailableError } from "../demoData.js";

const EMAIL_RE = /\S+@\S+\.\S+/;
const VALID_STATUS = ["active", "on-leave", "inactive"];
const VALID_EMPLOYMENT_TYPE = ["Full-time", "Part-time", "Contract"];

function toApi(row) {
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
  };
}

function toDemoApi(row) {
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
  };
}

export const getAllEmployees = async (req, res) => {
  try {
    try {
      const employees = await Employee.getAll();
      return res.json(employees.map(toApi));
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;
      return res.json(DEMO_EMPLOYEES.map(toDemoApi));
    }
  } catch (err) {
    console.error("Get employees error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    try {
      const employee = await Employee.findById(id);

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.json(toApi(employee));
    } catch (err) {
      if (!isDbUnavailableError(err)) throw err;

      const employee = DEMO_EMPLOYEES.find((item) => item.id === id);
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      return res.json(toDemoApi(employee));
    }
  } catch (err) {
    console.error("Get employee error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      hireDate,
      salary,
      employmentType,
      status,
      manager,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email) {
      return res
        .status(400)
        .json({ error: "First name, last name, and email are required." });
    }

    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (employmentType && !VALID_EMPLOYMENT_TYPE.includes(employmentType)) {
      return res.status(400).json({
        error: `Employment type must be one of: ${VALID_EMPLOYMENT_TYPE.join(", ")}`,
      });
    }

    if (salary && (isNaN(salary) || salary < 0)) {
      return res
        .status(400)
        .json({ error: "Salary must be a non-negative number." });
    }

    const id = await Employee.create({
      firstName,
      lastName,
      email,
      phone: phone || null,
      department: department || null,
      position: position || null,
      hireDate: hireDate || null,
      salary: salary || 0,
      employmentType: employmentType || "Full-time",
      status: status || "active",
      manager: manager || null,
    });

    const employee = await Employee.findById(id);
    res.status(201).json(toApi(employee));
  } catch (err) {
    console.error("Create employee error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      employmentType,
      status,
      manager,
    } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Employee ID is required." });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Validation
    if (email && !EMAIL_RE.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (status && !VALID_STATUS.includes(status)) {
      return res
        .status(400)
        .json({ error: `Status must be one of: ${VALID_STATUS.join(", ")}` });
    }

    if (employmentType && !VALID_EMPLOYMENT_TYPE.includes(employmentType)) {
      return res.status(400).json({
        error: `Employment type must be one of: ${VALID_EMPLOYMENT_TYPE.join(", ")}`,
      });
    }

    if (salary !== undefined && (isNaN(salary) || salary < 0)) {
      return res
        .status(400)
        .json({ error: "Salary must be a non-negative number." });
    }

    await Employee.update(id, {
      firstName,
      lastName,
      email,
      phone,
      department,
      position,
      salary,
      employmentType,
      status,
      manager,
    });

    const updated = await Employee.findById(id);
    res.json(toApi(updated));
  } catch (err) {
    console.error("Update employee error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    await Employee.delete(id);
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Delete employee error:", err);
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
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
