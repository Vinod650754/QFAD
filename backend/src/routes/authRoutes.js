import express from "express";
import { body } from "express-validator";
import {
  forgotPassword,
  login,
  loginRules,
  me,
  resetPassword,
  signup,
  signupRules
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/signup", signupRules, validate, signup);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);
router.post("/forgot-password", body("email").isEmail().normalizeEmail(), validate, forgotPassword);
router.post(
  "/reset-password",
  [body("token").notEmpty(), body("password").isLength({ min: 6 })],
  validate,
  resetPassword
);

export default router;
