import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  findDemoUserByUsername,
  findDemoUserById,
  isDbUnavailableError,
} from "../demoData.js";

export const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required." });
    }

    try {
      const user = await User.findByUsername(username);

      if (!user || !bcryptjs.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const payload = {
        sub: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        employeeId: user.employee_id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ token, user: payload });
    } catch (dbErr) {
      if (!isDbUnavailableError(dbErr)) throw dbErr;

      const demoUser = findDemoUserByUsername(username);
      if (
        !demoUser ||
        !bcryptjs.compareSync(password, demoUser.password_hash)
      ) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const payload = {
        sub: demoUser.id,
        username: demoUser.username,
        fullName: demoUser.full_name,
        role: demoUser.role,
        employeeId: demoUser.employee_id,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.json({ token, user: payload });
    }
  } catch (err) {
    console.error("Login error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    try {
      const user = await User.findById(req.user.sub);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          employeeId: user.employee_id,
        },
      });
    } catch (dbErr) {
      if (!isDbUnavailableError(dbErr)) throw dbErr;

      const demoUser = findDemoUserById(req.user.sub);
      if (!demoUser) {
        return res.status(404).json({ error: "User not found" });
      }

      return res.json({
        user: {
          id: demoUser.id,
          username: demoUser.username,
          fullName: demoUser.full_name,
          role: demoUser.role,
          employeeId: demoUser.employee_id,
        },
      });
    }
  } catch (err) {
    console.error("GetMe error:", err);
    if (isDbUnavailableError(err)) {
      return res.status(503).json({
        error:
          "Database not connected. Run the SQL in database-setup.sql, set the DB_* values in .env, then `npm run seed`. Read endpoints fall back to demo data, but writes require a live database.",
      });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export default { login, getMe };
