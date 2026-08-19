import pool from "../config/db.js";

const ALLOWED_TABLES = new Set([
  "employees",
  "attendance",
  "payroll",
  "time_off_requests",
]);

// Generates the next sequential id for a table whose primary key is a
// prefixed string (e.g. "EMP001", "ATT002"), since these tables do not
// use AUTO_INCREMENT and mysql2's `insertId` is not available for them.
export async function generateId(table, prefix) {
  if (!ALLOWED_TABLES.has(table)) {
    throw new Error(`generateId: unsupported table "${table}"`);
  }

  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(
      `SELECT id FROM ${table} WHERE id LIKE ? ORDER BY LENGTH(id) DESC, id DESC LIMIT 1`,
      [`${prefix}%`],
    );

    if (rows.length === 0) {
      return `${prefix}001`;
    }

    const lastId = rows[0].id;
    const numericPart = parseInt(lastId.slice(prefix.length), 10);
    const next = (Number.isNaN(numericPart) ? 0 : numericPart) + 1;
    return `${prefix}${String(next).padStart(3, "0")}`;
  } finally {
    connection.release();
  }
}

export default generateId;
