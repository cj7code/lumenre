// ============================================================================
// TUTOR ROUTES
// - Handles Tutor-level staff operations
// - Tutors can create content, quizzes, drafts, uploads
// - Tutors CANNOT delete modules or manage users
// ============================================================================

import express from "express";
import { staffAuth } from "../middleware/staffAuth.js";

import Module from "../models/Module.js";

// ============================================================================
// FILE UPLOAD MIDDLEWARE (Cloudinary)
// ============================================================================
import uploadToCloud from "../middleware/uploadToCloud.js";

// ============================================================================
// MODULE FILE CONTROLLERS
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
// DRAFT CONTROLLERS (AI drafts)
// ============================================================================
import {
  createDraft,
  listDrafts,
  getDraft,
  publishDraft,
  deleteDraft,
} from "../controllers/draftController.js";

// ============================================================================
// QUIZ CONTROLLERS (Tutor scope)
// ============================================================================
import {
  createQuizForModule,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

const router = express.Router();

/* ============================================================================
   MODULE MANAGEMENT
============================================================================ */

// Create module (Tutor allowed)
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
    console.error("TUTOR GET MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to load module" });
  }
});

/* ------------------------------------------------------------------
   UPDATE MODULE METADATA (Tutor)
   - Tutors can rename modules
   - Tutors CANNOT delete modules
------------------------------------------------------------------ */
router.put(
  "/modules/:moduleId",
  staffAuth,
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
    console.error("TUTOR UPDATE MODULE CONTENT ERROR:", err);
    res.status(500).json({ error: "Failed to update module content" });
  }
});

/* ============================================================================
   QUIZ MANAGEMENT (Tutor)
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

// Delete quiz (Tutor allowed for own work)
router.delete(
  "/quizzes/:quizId",
  staffAuth,
  deleteQuiz
);

/* ============================================================================
   DRAFT MANAGEMENT (Tutor)
============================================================================ */

// Create AI draft
router.post("/drafts", staffAuth, uploadToCloud, createDraft);

// List drafts
router.get("/drafts", staffAuth, listDrafts);

// Get single draft
router.get("/drafts/:id", staffAuth, getDraft);

// Publish draft
router.post("/drafts/:id/publish", staffAuth, publishDraft);

// Delete draft
router.delete("/drafts/:id", staffAuth, deleteDraft);

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

// Track downloads (analytics)
router.get(
  "/modules/:moduleId/files/:publicId/download",
  staffAuth,
  incrementDownload
);

export default router;
