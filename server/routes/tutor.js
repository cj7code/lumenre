import express from "express";
import { adminAuth } from "../middleware/adminAuth.js"; // allows tutor+admin
import tutorOnly from "../middleware/tutorOnly.js";
import {
  uploadToCloud,
  uploadModuleFile,
  listModuleFiles,
  deleteModuleFile
} from "../controllers/moduleUploadController.js";

const router = express.Router();

// Tutor Upload
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
