// ============================================================================
// TUTOR ROUTES
// ============================================================================

import express from "express";
import { staffAuth } from "../middleware/staffAuth.js";

import Module from "../models/Module.js";

// Cloudinary upload
import uploadToCloud from "../middleware/uploadToCloud.js";

// File handlers
import {
  uploadModuleFile,
  listModuleFiles,
  deleteModuleFile,
  incrementDownload,
} from "../controllers/moduleUploadController.js";

// Module controllers
import {
  createModule,
  listModulesByCourse,
} from "../controllers/moduleController.js";

// Draft controllers
import {
  createDraft,
  listDrafts,
  getDraft,
  publishDraft,
  deleteDraft,
} from "../controllers/draftController.js";

// Tutor quiz creation
import { tutorCreateQuiz } from "../controllers/tutorQuizController.js";

const router = express.Router();

// ============================================================================
// MODULE CREATION
// ============================================================================
router.post("/modules", staffAuth, createModule);

router.get("/courses/:courseId/modules", staffAuth, listModulesByCourse);

// ============================================================================
// FILE MANAGEMENT (Same as Admin)
// ============================================================================
router.post(
  "/modules/:moduleId/upload",
  staffAuth,
  uploadToCloud,
  uploadModuleFile
);

router.get("/modules/:moduleId/files", staffAuth, listModuleFiles);

router.delete(
  "/modules/:moduleId/files/:publicId",
  staffAuth,
  deleteModuleFile
);

router.get(
  "/modules/:moduleId/files/:publicId/download",
  staffAuth,
  incrementDownload
);

// ============================================================================
// DRAFT MANAGEMENT
// ============================================================================
router.post("/drafts", staffAuth, uploadToCloud, createDraft);
router.get("/drafts", staffAuth, listDrafts);
router.get("/drafts/:id", staffAuth, getDraft);
router.post("/drafts/:id/publish", staffAuth, publishDraft);
router.delete("/drafts/:id", staffAuth, deleteDraft);

// ============================================================================
// QUIZ BUILDER
// ============================================================================
router.post(
  "/modules/:moduleId/quizzes",
  staffAuth,
  tutorCreateQuiz
);

// ============================================================================
// GET SINGLE MODULE
// ============================================================================
router.get("/modules/:moduleId", staffAuth, async (req, res) => {
  try {
    const mod = await Module.findById(req.params.moduleId)
      .populate("course", "title")
      .lean();

    if (!mod) return res.status(404).json({ error: "Module not found" });

    res.json(mod);
  } catch (err) {
    console.error("GET MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to load module" });
  }
});

// ============================================================================
// UPDATE MODULE CONTENT (Manual + AI)
// ============================================================================
router.put("/modules/:moduleId/content", staffAuth, async (req, res) => {
  try {
    const { content } = req.body;

    const updated = await Module.findByIdAndUpdate(
      req.params.moduleId,
      { content },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ error: "Module not found" });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE MODULE CONTENT ERROR:", err);
    res.status(500).json({ error: "Failed to update module content" });
  }
});

// ============================================================================
// FIX: Tutor listing modules always returns correct response
// ============================================================================
router.get("/courses/:courseId/modules", staffAuth, async (req, res) => {
  try {
    const modules = await Module.find({
      course: req.params.courseId,
    }).lean();

    res.json(modules);
  } catch (err) {
    console.error("TUTOR LIST MODULES ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
});

export default router;
