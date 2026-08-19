import express from "express";
import { login, getMe } from "../controllers/authControllers.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.get("/me", requireAuth, getMe);

export default router;
