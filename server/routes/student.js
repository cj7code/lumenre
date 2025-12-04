// server/routes/student.js
// ============================================================================
// STUDENT ROUTES (Clean, final integration)
// ============================================================================

import express from "express";
import Module from "../models/Module.js";
import Course from "../models/Course.js";

import { userAuth } from "../middleware/userAuth.js";

import { getQuizById } from "../controllers/quizController.js";
import {
  submitQuiz,
  getAttempts,
} from "../controllers/quizAttemptController.js";

const router = express.Router();

// ======================================================
// 🔥 LOGGING MIDDLEWARE
// ======================================================
router.use((req, res, next) => {
  console.log("STUDENT API:", req.method, req.originalUrl);
  next();
});

// ============================================================================
// GET SINGLE MODULE — used in StudentModuleView
// ============================================================================
router.get("/modules/:id", async (req, res) => {
  try {
    const mod = await Module.findById(req.params.id)
      .populate("course", "title")
      .populate("quizzes", "title createdAt")
      .lean();

    if (!mod) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(mod);
  } catch (err) {
    console.error("STUDENT VIEW MODULE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================================
// GET ALL COURSES — Student dashboard list
// ============================================================================
router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.json(courses);
  } catch (err) {
    console.error("LOAD COURSES ERROR:", err);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// ============================================================================
// GET MODULES BY COURSE — Student course view page
// ============================================================================
router.get("/courses/:courseId/modules", async (req, res) => {
  try {
    const modules = await Module.find({
      course: req.params.courseId,
    })
      .select("title createdAt updatedAt")
      .lean();

    res.json(modules);
  } catch (err) {
    console.error("LOAD MODULES ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
});

// ============================================================================
// QUIZ ENDPOINTS (protected – require login token)
// ============================================================================
router.get("/quiz/:quizId", userAuth, getQuizById);
router.post("/quiz/:quizId/submit", userAuth, submitQuiz);
router.get("/quiz/:quizId/attempts", userAuth, getAttempts);

export default router;
