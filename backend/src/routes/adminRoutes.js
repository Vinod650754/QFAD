import express from "express";
import { param } from "express-validator";
import {
  analytics,
  deleteUserContent,
  resetStreak,
  updateUser,
  users
} from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.use(protect, requireAdmin);
router.get("/analytics", analytics);
router.get("/users", users);
router.patch("/users/:id", param("id").isMongoId(), validate, updateUser);
router.post("/users/:id/reset-streak", param("id").isMongoId(), validate, resetStreak);
router.delete("/users/:id/content", param("id").isMongoId(), validate, deleteUserContent);

export default router;
