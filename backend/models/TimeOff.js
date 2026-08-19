import pool from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export class TimeOff {
  static async create(data) {
    const id = await generateId("time_off_requests", "TO");
    const connection = await pool.getConnection();
    try {
      await connection.query(
        "INSERT INTO time_off_requests (id, employee_id, employee_name, type, start_date, end_date, days, reason, status, submitted_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          data.employeeId,
          data.employeeName,
          data.type,
          data.startDate,
          data.endDate,
          data.days,
          data.reason,
          data.status,
          data.submittedDate,
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
        "SELECT * FROM time_off_requests WHERE id = ?",
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
        "SELECT * FROM time_off_requests WHERE employee_id = ? ORDER BY start_date DESC",
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
        "SELECT * FROM time_off_requests ORDER BY start_date DESC",
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async getByStatus(status) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM time_off_requests WHERE status = ? ORDER BY start_date DESC",
        [status],
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

      if (data.status) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.reason) {
        updates.push("reason = ?");
        values.push(data.reason);
      }
      if (data.days !== undefined) {
        updates.push("days = ?");
        values.push(data.days);
      }

      if (updates.length === 0) return false;

      values.push(id);
      const [result] = await connection.query(
        `UPDATE time_off_requests SET ${updates.join(", ")} WHERE id = ?`,
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
        "DELETE FROM time_off_requests WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default TimeOff;
