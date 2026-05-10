import express from "express";
import { answerRules, history, submitAnswer } from "../controllers/answerController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/", protect, answerRules, validate, submitAnswer);
router.get("/history", protect, history);

export default router;
