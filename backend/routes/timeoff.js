import express from "express";
import {
  getAllTimeOff,
  getTimeOffById,
  getTimeOffByEmployee,
  getTimeOffByStatus,
  createTimeOff,
  updateTimeOff,
  deleteTimeOff,
} from "../controllers/timeoffControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getAllTimeOff);
router.get("/:id", requireAuth, getTimeOffById);
router.get("/employee/:employeeId", requireAuth, getTimeOffByEmployee);
router.get("/status/query", requireAuth, getTimeOffByStatus);
router.post("/", requireAuth, createTimeOff);
router.put("/:id/approve", requireAuth, (req, res, next) => {
  req.body = { ...req.body, status: "approved" };
  updateTimeOff(req, res, next);
});
router.put("/:id/reject", requireAuth, (req, res, next) => {
  req.body = { ...req.body, status: "rejected" };
  updateTimeOff(req, res, next);
});
router.put("/:id", requireAuth, updateTimeOff);
router.patch("/:id", requireAuth, updateTimeOff);
router.delete("/:id", requireAuth, deleteTimeOff);

export default router;
