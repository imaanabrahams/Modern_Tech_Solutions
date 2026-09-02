import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import authRoutes from "./routes/auth.js";
import attendanceRoutes from "./routes/attendance.js";
import employeesRoutes from "./routes/employees.js";
import payrollRoutes from "./routes/payroll.js";
import timeoffRoutes from "./routes/timeoff.js";
import { checkDatabaseConnection } from "./config/db.js";

dotenv.config({ override: true });

const app = express();

// Development default for JWT secret
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

app.use(cors());
app.use(express.json());

// Serve frontend static files if present
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The frontend folder lives one level up, alongside /backend
const frontendPath = join(__dirname, "..", "frontend");
const frontendExists = fs.existsSync(join(frontendPath, "index.html"));

if (frontendExists) {
  app.use(express.static(frontendPath));
}

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/timeoff", timeoffRoutes);

// Root + any non-API route falls back to the frontend (if present)
app.get(/^(?!\/api).*/, (req, res) => {
  if (frontendExists) {
    return res.sendFile(join(frontendPath, "index.html"));
  }
  res.status(200).json({ message: "Modern Tech Solutions backend is running." });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Modern Tech Solutions backend running on port ${PORT}`);
  try {
    await checkDatabaseConnection();
    console.log("Database connected successfully.");
  } catch (error) {
    console.warn(
      `Database unavailable at ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || 3306} (${error.code || error.message}). Read-only demo data is enabled; employee changes require MySQL to be running and configured in backend/.env.`,
    );
  }
});
