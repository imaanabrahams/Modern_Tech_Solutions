import pool from "../config/db.js";

export class User {
  static async findByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT * FROM users WHERE username = ?",
        [username],
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT id, username, full_name, role, employee_id FROM users WHERE id = ?",
        [id],
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async create(username, passwordHash, fullName, role, employeeId) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        "INSERT INTO users (username, password_hash, full_name, role, employee_id) VALUES (?, ?, ?, ?, ?)",
        [username, passwordHash, fullName, role, employeeId],
      );
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query(
        "SELECT id, username, full_name, role, employee_id FROM users",
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

export default User;
