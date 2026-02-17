// server/routes/student.js
// ============================================================================
// STUDENT ROUTES — FINAL, CLEAN & LMS-CORRECT
//
// Purpose:
// - Provide student-facing data for dashboard & reader
// - Ensure modules expose ALL learning resources:
//   • readable content
//   • attachments (pdf, ppt, images, videos)
//   • quizzes (metadata for listing, full data when opened)
//
// Key Design:
// - LIGHT endpoints for lists (dashboard, left pane)
// - FULL endpoints for reading / attempting quizzes
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

// ============================================================================
// 🔎 LOGGING MIDDLEWARE (safe, non-blocking)
// ============================================================================
router.use((req, res, next) => {
  console.log("STUDENT API:", req.method, req.originalUrl);
  next();
});

// ============================================================================
// GET ALL COURSES
// Used by:
// - Landing dashboard
// - Student dashboard (left pane course list)
//
// NOTE:
// - Do NOT populate modules here (performance)
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
// GET MODULES BY COURSE  ⭐ IMPORTANT FIX ⭐
// Used by:
// - Student dashboard LEFT PANE
//
// Returns LIGHT module objects with:
// - title
// - attachments
// - quizzes (metadata only: id + title)
//
// WHY:
// - Allows dashboard to show ALL learning resources under a module
// - Avoids loading full quiz questions prematurely
// ============================================================================
router.get("/courses/:courseId/modules", async (req, res) => {
  try {
    const modules = await Module.find({
      course: req.params.courseId,
    })
      .select("title createdAt updatedAt attachments quizzes")
      .populate("quizzes", "title createdAt")
      .lean();

    res.json(modules);
  } catch (err) {
    console.error("LOAD MODULES ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
});

// ============================================================================
// GET SINGLE MODULE (FULL VIEW)
// Used by:
// - Student module reader (right pane / full screen)
//
// Returns:
// - full content (HTML)
// - attachments
// - quizzes (metadata)
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

    // Normalize response (frontend-safe)
    res.json({
      _id: mod._id,
      title: mod.title,
      content: mod.content || "",
      attachments: mod.attachments || [],
      quizzes: mod.quizzes || [],
      course: mod.course,
      createdAt: mod.createdAt,
      updatedAt: mod.updatedAt,
    });
  } catch (err) {
    console.error("STUDENT VIEW MODULE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================================
// QUIZ ENDPOINTS (STUDENT)
// ============================================================================
router.get("/quiz/:quizId", userAuth, getQuizById);
router.post("/quiz/:quizId/submit", userAuth, submitQuiz);
router.get("/quiz/:quizId/attempts", userAuth, getAttempts);

export default router;
