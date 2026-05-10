import express from "express";
import { nextQuestion, topicProgress } from "../controllers/recommendationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/next", protect, nextQuestion);
router.get("/topics", protect, topicProgress);

export default router;
