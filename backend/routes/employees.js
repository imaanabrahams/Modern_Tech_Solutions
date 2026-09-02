import express from "express";
import {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employeesControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.get("/", requireAuth, getAllEmployees);
router.get("/:id", requireAuth, getEmployeeById);
router.post("/", requireAuth, createEmployee);
router.put("/:id", requireAuth, updateEmployee);
router.patch("/:id", requireAuth, updateEmployee);
router.delete("/:id", requireAuth, deleteEmployee);

export default router;
