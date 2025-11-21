// tutor.js
import express from "express";
import { adminAuth } from "../middleware/staffAuth.js"; 
import tutorOnly from "../middleware/tutorOnly.js";

import {
  uploadToCloud,
  createDraft,
  listDrafts,
  getDraft,
  publishDraft
} from "../controllers/adminController.js";

import {
  uploadModuleFile,
  listModuleFiles,
  deleteModuleFile
} from "../controllers/moduleUploadController.js";

const router = express.Router();

// ---------------------------
// Tutor Draft Routes
// ---------------------------
router.post(
  "/drafts",
  adminAuth,
  tutorOnly,
  uploadToCloud.single("file"),
  createDraft
);

router.get(
  "/drafts",
  adminAuth,
  tutorOnly,
  listDrafts
);

router.post(
  "/drafts/:id/publish",
  adminAuth,
  tutorOnly,
  publishDraft
);

// ---------------------------
// Tutor File Uploads
// ---------------------------
router.post(
  "/uploads/:moduleId",
  adminAuth,
  tutorOnly,
  uploadToCloud.single("file"),
  uploadModuleFile
);

router.get(
  "/uploads/:moduleId",
  adminAuth,
  tutorOnly,
  listModuleFiles
);

router.delete(
  "/uploads/:moduleId/:publicId",
  adminAuth,
  tutorOnly,
  deleteModuleFile
);

export default router;
