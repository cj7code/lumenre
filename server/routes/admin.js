// ============================================================================
// ADMIN ROUTES
// ============================================================================

import express from "express";
import { staffAuth } from "../middleware/staffAuth.js";
import adminOnly from "../middleware/adminOnly.js";

import Module from "../models/Module.js";

// Cloudinary upload
import uploadToCloud from "../middleware/uploadToCloud.js";

// Draft Controllers
import {
  createDraft,
  listDrafts,
  getDraft,
  publishDraft,
  deleteDraft,
} from "../controllers/draftController.js";

// File Controllers
import {
  uploadModuleFile,
  listModuleFiles,
  deleteModuleFile,
  incrementDownload,
} from "../controllers/moduleUploadController.js";

// Module Controllers
import {
  createModule,
  listModulesByCourse,
} from "../controllers/moduleController.js";

// Quiz Controllers
import {
  createQuizForModule,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";

// Admin User Controllers
import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUserRole,
  adminDeleteUser,
} from "../controllers/adminUserController.js";

const router = express.Router();

// ============================================================================
// DRAFT MANAGEMENT (Admin + Tutor)
// ============================================================================
router.post("/drafts", staffAuth, uploadToCloud, createDraft);
router.get("/drafts", staffAuth, listDrafts);
router.get("/drafts/:id", staffAuth, getDraft);
router.post("/drafts/:id/publish", staffAuth, publishDraft);
router.delete("/drafts/:id", staffAuth, deleteDraft);

// ============================================================================
// ADMIN USER MANAGEMENT
// ============================================================================
router.get("/users", staffAuth, adminOnly, adminListUsers);
router.post("/users", staffAuth, adminOnly, adminCreateUser);
router.put("/users/:id/role", staffAuth, adminOnly, adminUpdateUserRole);
router.delete("/users/:id", staffAuth, adminOnly, adminDeleteUser);

// ============================================================================
// MODULE CREATION
// ============================================================================
router.post("/modules", staffAuth, createModule);

router.get("/courses/:courseId/modules", staffAuth, listModulesByCourse);

// ============================================================================
// QUIZ CREATION + MANAGEMENT
// ============================================================================

// create quiz
router.post("/modules/:moduleId/quizzes", staffAuth, createQuizForModule);

// edit quiz
router.put("/quizzes/:quizId", staffAuth, updateQuiz);

// delete quiz
router.delete("/quizzes/:quizId", staffAuth, deleteQuiz);

// ============================================================================
// MODULE FILE MANAGEMENT
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
// FIXED: List modules properly
// ============================================================================
router.get("/courses/:courseId/modules", staffAuth, async (req, res) => {
  try {
    const modules = await Module.find({
      course: req.params.courseId,
    }).lean();
    res.json(modules);
  } catch (err) {
    console.error("ADMIN LIST MODULES ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
});

// ============================================================================
// GET SINGLE MODULE (Populated)
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

export default router;
