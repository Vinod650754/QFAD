import express from "express";
import multer from "multer";
import { importDataset } from "../controllers/datasetController.js";
import { protect, requireAdmin } from "../middleware/auth.js";

const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } });
const router = express.Router();

router.post("/import", protect, requireAdmin, upload.single("dataset"), importDataset);

export default router;
