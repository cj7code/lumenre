// ============================================================================
// ADMIN ROUTES
// - Handles Admin & Tutor staff operations
// - Covers drafts, modules, quizzes, uploads, and user management
// - Students are NOT allowed here
// ============================================================================

import express from "express";
import { staffAuth } from "../middleware/staffAuth.js";     // admin + tutor
import adminOnly from "../middleware/adminOnly.js";         // admin only

import Module from "../models/Module.js";
import QuizAttempt from "../models/QuizAttempt.js";

// ============================================================================
// FILE UPLOAD MIDDLEWARE (Cloudinary)
// ============================================================================
import uploadToCloud from "../middleware/uploadToCloud.js";

// ============================================================================
// DRAFT CONTROLLERS (AI-generated content drafts)
// ============================================================================
import {
  createDraft,
  listDrafts,
  getDraft,
  publishDraft,
  deleteDraft,
} from "../controllers/draftController.js";

// ============================================================================
// MODULE FILE CONTROLLERS (PDFs, DOCs, slides, etc.)
// ============================================================================
import {
  uploadModuleFile,
  listModuleFiles,
  deleteModuleFile,
  incrementDownload,
} from "../controllers/moduleUploadController.js";

// ============================================================================
// MODULE CONTROLLERS
// ============================================================================
import {
  createModule,
  listModulesByCourse,
  updateModule,
} from "../controllers/moduleController.js";

// ============================================================================
// QUIZ CONTROLLERS
// ============================================================================
import {
  createQuizForModule,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

// ============================================================================
// ADMIN USER MANAGEMENT CONTROLLERS
// ============================================================================
import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUserRole,
  adminDeleteUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

/* ============================================================================
   DRAFT MANAGEMENT (Admin + Tutor)
   - Tutors & Admins can create drafts
   - Only staff can access drafts
============================================================================ */
router.post("/drafts", staffAuth, uploadToCloud, createDraft);
router.get("/drafts", staffAuth, listDrafts);
router.get("/drafts/:id", staffAuth, getDraft);
router.post("/drafts/:id/publish", staffAuth, publishDraft);
router.delete("/drafts/:id", staffAuth, deleteDraft);

/* ============================================================================
   ADMIN USER MANAGEMENT (Admin only)
============================================================================ */
router.get("/users", staffAuth, adminOnly, adminListUsers);
router.post("/users", staffAuth, adminOnly, adminCreateUser);
router.put("/users/:id/role", staffAuth, adminOnly, adminUpdateUserRole);
router.delete("/users/:id", staffAuth, adminOnly, adminDeleteUser);

/* ============================================================================
   MODULE MANAGEMENT
============================================================================ */

// Create module (Admin + Tutor)
router.post("/modules", staffAuth, createModule);

// List modules by course (used by CourseModuleSelector)
router.get(
  "/courses/:courseId/modules",
  staffAuth,
  listModulesByCourse
);

// Get single module (used by ModuleContentEditor)
router.get("/modules/:moduleId", staffAuth, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.moduleId)
      .populate("course", "title")
      .lean();

    if (!mod) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(mod);
  } catch (err) {
    console.error("GET MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to load module" });
  }
});

/* ------------------------------------------------------------------
   UPDATE MODULE METADATA (Admin)
   - Enables editing module name in ModuleCreator
------------------------------------------------------------------ */
router.put(
  "/modules/:moduleId",
  staffAuth,
  adminOnly,
  updateModule
);

// Update module content (TipTap / AI editor)
router.put("/modules/:moduleId/content", staffAuth, async (req, res) => {
  try {
    const { content } = req.body;

    const updated = await Module.findByIdAndUpdate(
      req.params.moduleId,
      { content },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("UPDATE MODULE CONTENT ERROR:", err);
    res.status(500).json({ error: "Failed to update module content" });
  }
});

// ❗ DELETE MODULE (Admin only)
router.delete(
  "/modules/:moduleId",
  staffAuth,
  adminOnly,
  async (req, res) => {
    try {
      const deleted = await Module.findByIdAndDelete(req.params.moduleId);

      if (!deleted) {
        return res.status(404).json({ error: "Module not found" });
      }

      res.json({ message: "Module deleted successfully" });
    } catch (err) {
      console.error("DELETE MODULE ERROR:", err);
      res.status(500).json({ error: "Failed to delete module" });
    }
  }
);

/* ============================================================================
   QUIZ MANAGEMENT
============================================================================ */

// Create quiz for module
router.post(
  "/modules/:moduleId/quizzes",
  staffAuth,
  createQuizForModule
);

// Update quiz
router.put(
  "/quizzes/:quizId",
  staffAuth,
  updateQuiz
);

// Delete quiz
router.delete(
  "/quizzes/:quizId",
  staffAuth,
  deleteQuiz
);

/* ============================================================================
   MODULE FILE MANAGEMENT
============================================================================ */

// Upload teaching material
router.post(
  "/modules/:moduleId/upload",
  staffAuth,
  uploadToCloud,
  uploadModuleFile
);

// List module files
router.get(
  "/modules/:moduleId/files",
  staffAuth,
  listModuleFiles
);

// Delete module file
router.delete(
  "/modules/:moduleId/files/:publicId",
  staffAuth,
  deleteModuleFile
);

// Track downloads (analytics only)
router.get(
  "/modules/:moduleId/files/:publicId/download",
  staffAuth,
  incrementDownload
);

// ----------------------------------------------------------
// Quiz Analytics Endpoint
// Uses QuizAttempt + Quiz models exactly as defined
// ----------------------------------------------------------

/**
 * GET /api/admin/quiz-attempts
 *
 * Aggregated quiz analytics:
 * - One row per user per quiz
 * - Attempt count
 * - Best percentage score
 * - Last attempt date
 */
router.get("/quiz-attempts", async (req, res) => {
  try {
    const analytics = await QuizAttempt.aggregate([
      // --------------------------------------------------
      // Group attempts by (user + quiz)
      // --------------------------------------------------
      {
        $group: {
          _id: {
            user: "$user",
            quiz: "$quiz",
          },

          // Number of attempts
          attemptCount: { $sum: 1 },

          // Best raw score achieved
          bestScore: { $max: "$score" },

          // Use the maximum totalMarks encountered
          totalMarks: { $max: "$totalMarks" },

          // Last attempt timestamp
          lastAttemptAt: { $max: "$createdAt" },
        },
      },

      // --------------------------------------------------
      // Join USER info
      // --------------------------------------------------
      {
        $lookup: {
          from: "users",
          localField: "_id.user",
          foreignField: "_id",
          as: "user",
        },
      },

      // --------------------------------------------------
      // Join QUIZ info
      // --------------------------------------------------
      {
        $lookup: {
          from: "quizzes",
          localField: "_id.quiz",
          foreignField: "_id",
          as: "quiz",
        },
      },

      // --------------------------------------------------
      // Shape final output for frontend
      // --------------------------------------------------
      {
        $project: {
          _id: 0,

          candidateName: {
            $ifNull: [{ $arrayElemAt: ["$user.name", 0] }, "Unknown"],
          },

          quizTitle: {
            $ifNull: [{ $arrayElemAt: ["$quiz.title", 0] }, "Untitled Quiz"],
          },

          attemptCount: 1,

          // Convert raw score → percentage
          bestScore: {
            $cond: [
              { $gt: ["$totalMarks", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$bestScore", "$totalMarks"] },
                      100,
                    ],
                  },
                  0,
                ],
              },
              0,
            ],
          },

          lastAttemptAt: 1,
        },
      },

      // --------------------------------------------------
      // Most recent activity first
      // --------------------------------------------------
      { $sort: { lastAttemptAt: -1 } },
    ]);

    res.json(analytics);
  } catch (error) {
    console.error("Quiz analytics error:", error);
    res.status(500).json({
      message: "Failed to load quiz analytics",
    });
  }
});

export default router;
