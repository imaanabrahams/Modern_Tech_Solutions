import express from "express";
import {
  getAllAttendance,
  getAttendanceById,
  getAttendanceByEmployee,
  getAttendanceByDateRange,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../controllers/attendanceControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getAllAttendance);
router.get("/:id", requireAuth, getAttendanceById);
router.get("/employee/:employeeId", requireAuth, getAttendanceByEmployee);
router.get("/range/query", requireAuth, getAttendanceByDateRange);
router.post("/", requireAuth, createAttendance);
router.put("/:id", requireAuth, updateAttendance);
router.delete("/:id", requireAuth, deleteAttendance);

export default router;
