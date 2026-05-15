import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import adminRoutes from "./routes/adminRoutes.js";
import answerRoutes from "./routes/answerRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import datasetRoutes from "./routes/datasetRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";

dotenv.config();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "https://qfad.vercel.app"].filter(Boolean);
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  exposedHeaders: ["Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));

app.get("/", (req, res) => {
  res.json({
    message: "Backend API Running Successfully"
  });
});
app.get("/health", (req, res) => {
  res.json({
    status: "ok"
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/answers", answerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
