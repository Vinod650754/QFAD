import express from "express";
import { body, param } from "express-validator";
import {
  leaderboard,
  markNotificationRead,
  notifications,
  profile,
  updateProfile
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/profile", protect, profile);
router.put(
  "/profile",
  protect,
  [body("name").optional().trim().isLength({ min: 2 }), body("avatarColor").optional().isHexColor()],
  validate,
  updateProfile
);
router.get("/leaderboard", protect, leaderboard);
router.get("/notifications", protect, notifications);
router.patch(
  "/notifications/:id/read",
  protect,
  param("id").isMongoId(),
  validate,
  markNotificationRead
);

export default router;
