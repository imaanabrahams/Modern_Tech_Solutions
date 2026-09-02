import express from "express";
import {
  getAllPayroll,
  getPayrollById,
  getPayrollByEmployee,
  getPayrollByMonthYear,
  createPayroll,
  updatePayroll,
  deletePayroll,
} from "../controllers/payrollControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getAllPayroll);
router.get("/:id", requireAuth, getPayrollById);
router.get("/employee/:employeeId", requireAuth, getPayrollByEmployee);
router.get("/month-year/query", requireAuth, getPayrollByMonthYear);
router.post("/", requireAuth, createPayroll);
router.put("/:id/process", requireAuth, (req, res, next) => {
  req.body = { ...req.body, status: "processing" };
  updatePayroll(req, res, next);
});
router.put("/:id", requireAuth, updatePayroll);
router.patch("/:id", requireAuth, updatePayroll);
router.delete("/:id", requireAuth, deletePayroll);

export default router;
