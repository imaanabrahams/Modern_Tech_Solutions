import pool from "../config/db.js";
import { generateId } from "../utils/generateId.js";

export class Employee {
  static async create(data) {
    const id = await generateId("employees", "EMP");
    const connection = await pool.getConnection();
    try {
      await connection.query(
        "INSERT INTO employees (id, first_name, last_name, email, phone, department, position, hire_date, salary, employment_type, status, manager) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          id,
          data.firstName,
          data.lastName,
          data.email,
          data.phone,
          data.department,
          data.position,
          data.hireDate,
          data.salary,
          data.employmentType,
          data.status,
          data.manager || null,
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
        "SELECT * FROM employees WHERE id = ?",
        [id],
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  static async getAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query("SELECT * FROM employees");
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

      if (data.firstName) {
        updates.push("first_name = ?");
        values.push(data.firstName);
      }
      if (data.lastName) {
        updates.push("last_name = ?");
        values.push(data.lastName);
      }
      if (data.email) {
        updates.push("email = ?");
        values.push(data.email);
      }
      if (data.phone) {
        updates.push("phone = ?");
        values.push(data.phone);
      }
      if (data.department) {
        updates.push("department = ?");
        values.push(data.department);
      }
      if (data.position) {
        updates.push("position = ?");
        values.push(data.position);
      }
      if (data.salary !== undefined) {
        updates.push("salary = ?");
        values.push(data.salary);
      }
      if (data.status) {
        updates.push("status = ?");
        values.push(data.status);
      }
      if (data.employmentType) {
        updates.push("employment_type = ?");
        values.push(data.employmentType);
      }
      if (data.manager) {
        updates.push("manager = ?");
        values.push(data.manager);
      }

      if (updates.length === 0) return false;

      values.push(id);
      const [result] = await connection.query(
        `UPDATE employees SET ${updates.join(", ")} WHERE id = ?`,
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
        "DELETE FROM employees WHERE id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

export default Employee;
