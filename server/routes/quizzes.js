// server/routes/quizzes.js
import express from "express";
import { listQuizzes, getQuizById } from "../controllers/quizController.js";

const router = express.Router();

// List Quizzes Public
router.get("/", listQuizzes);

// Optional single quiz fetch
router.get("/:quizId", getQuizById);

export default router;
