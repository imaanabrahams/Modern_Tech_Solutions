import pool from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export class Attendance {
  static async create(data) {
    const id = await generateId("attendance", "ATT");
    const connection = await pool.getConnection();
    try {
      await connection.query(
        "INSERT INTO attendance (id, employee_id, employee_name, date, check_in, check_out, hours_worked, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          data.employeeId,
          data.employeeName,
          data.date,
          data.checkIn,
          data.checkOut,
          data.hoursWorked,
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
        "SELECT * FROM attendance WHERE id = ?",
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
        "SELECT * FROM attendance WHERE employee_id = ? ORDER BY date DESC",
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
        "SELECT * FROM attendance ORDER BY date DESC",
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getByDateRange(startDate, endDate) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM attendance WHERE date BETWEEN ? AND ? ORDER BY date DESC",
        [startDate, endDate],
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

      if (data.checkIn) {
        updates.push("check_in = ?");
        values.push(data.checkIn);
      }
      if (data.checkOut) {
        updates.push("check_out = ?");
        values.push(data.checkOut);
      }
      if (data.hoursWorked !== undefined) {
        updates.push("hours_worked = ?");
        values.push(data.hoursWorked);
      }
      if (data.status) {
        updates.push("status = ?");
        values.push(data.status);
      }

      if (updates.length === 0) return false;

      values.push(id);
      const [result] = await connection.query(
        `UPDATE attendance SET ${updates.join(", ")} WHERE id = ?`,
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
        "DELETE FROM attendance WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default Attendance;
