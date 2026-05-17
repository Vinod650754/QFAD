import express from "express";
import {
  createQuestion,
  deleteQuestion,
  getDailyQuestion,
  idRule,
  listQuestions,
  questionRules,
  updateQuestion
} from "../controllers/questionController.js";
import { protect, requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.get("/daily", protect, getDailyQuestion);
router.get("/today", protect, getDailyQuestion);
router.get("/", protect, requireAdmin, listQuestions);
router.post("/", protect, requireAdmin, questionRules, validate, createQuestion);
router.put("/:id", protect, requireAdmin, idRule, validate, updateQuestion);
router.delete("/:id", protect, requireAdmin, idRule, validate, deleteQuestion);

export default router;
