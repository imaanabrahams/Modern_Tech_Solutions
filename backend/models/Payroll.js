import pool from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export class Payroll {
  static async create(data) {
    const id = await generateId("payroll", "PAY");
    const connection = await pool.getConnection();
    try {
      await connection.query(
        "INSERT INTO payroll (id, employee_id, employee_name, month, year, base_salary, hours_worked, overtime_hours, bonus, deductions, net_salary, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          data.employeeId,
          data.employeeName,
          data.month,
          data.year,
          data.baseSalary,
          data.hoursWorked,
          data.overtimeHours,
          data.bonus,
          data.deductions,
          data.netSalary,
          data.status,
        ],
      );
      return id;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM payroll WHERE id = ?",
        [id],
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async getByEmployeeId(employeeId) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM payroll WHERE employee_id = ? ORDER BY year DESC, month DESC",
        [employeeId],
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM payroll ORDER BY year DESC, month DESC",
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getByMonthYear(month, year) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM payroll WHERE month = ? AND year = ?",
        [month, year],
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async update(id, data) {
    const connection = await pool.getConnection();
    try {
      const updates = [];
      const values = [];

      if (data.baseSalary !== undefined) {
        updates.push("base_salary = ?");
        values.push(data.baseSalary);
      }
      if (data.hoursWorked !== undefined) {
        updates.push("hours_worked = ?");
        values.push(data.hoursWorked);
      }
      if (data.overtimeHours !== undefined) {
        updates.push("overtime_hours = ?");
        values.push(data.overtimeHours);
      }
      if (data.bonus !== undefined) {
        updates.push("bonus = ?");
        values.push(data.bonus);
      }
      if (data.deductions !== undefined) {
        updates.push("deductions = ?");
        values.push(data.deductions);
      }
      if (data.netSalary !== undefined) {
        updates.push("net_salary = ?");
        values.push(data.netSalary);
      }
      if (data.status) {
        updates.push("status = ?");
        values.push(data.status);
      }

      if (updates.length === 0) return false;

      values.push(id);
      const [result] = await connection.query(
        `UPDATE payroll SET ${updates.join(", ")} WHERE id = ?`,
        values,
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "DELETE FROM payroll WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default Payroll;
