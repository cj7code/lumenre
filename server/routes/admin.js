// server/routes/admin.js
// ------------------------------------------------------------
// Admin & Tutor-level content routes + Admin-only user management
// ------------------------------------------------------------

import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';   // JWT + allow admin/tutor
import adminOnly from "../middleware/adminOnly.js";       // STRICT admin only
import { uploadModuleFile, listModuleFiles } from "../controllers/moduleUploadController.js";


// AI Draft + Upload Controller
import {
  uploadToCloud,
  createDraft,
  listDrafts,
  getDraft,
  publishDraft
} from '../controllers/adminController.js';

// Admin User Management Controller (NEW — if added)
import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUserRole,
  adminDeleteUser
} from "../controllers/adminUserController.js";  // <-- Only if you added it

const router = express.Router();

// ------------------------------------------------------------
// PART 1: DRAFT & COURSE MANAGEMENT (Admin + Tutor Access)
// ------------------------------------------------------------

// 🔐 Both admin and tutor can upload, generate, list and publish drafts.

// Upload single file OR raw text → creates AI draft
router.post(
  '/drafts',
  adminAuth,                     // allow admin + tutor
  uploadToCloud.single('file'),
  createDraft
);

// List all drafts
router.get(
  '/drafts',
  adminAuth,                     // allow admin + tutor
  listDrafts
);

// Get a specific draft
router.get(
  '/drafts/:id',
  adminAuth,                     // allow admin + tutor
  getDraft
);

// Publish draft → attaches to module + generates quizzes
router.post(
  '/drafts/:id/publish',
  adminAuth,                     // allow admin + tutor
  publishDraft
);

// ------------------------------------------------------------
// PART 2: USER MANAGEMENT (ADMIN ONLY)
// ------------------------------------------------------------
// Only admins may modify user roles or create new users
// Tutors are blocked by the adminOnly middleware.

router.get(
  "/users",
  adminAuth,                     // Verify JWT + load user
  adminOnly,                     // Only admin allowed
  adminListUsers
);

router.post(
  "/users",
  adminAuth,
  adminOnly,                     // Only admin allowed
  adminCreateUser
);

router.put(
  "/users/:id/role",
  adminAuth,
  adminOnly,                     // Only admin allowed
  adminUpdateUserRole
);

router.delete(
  "/users/:id",
  adminAuth,
  adminOnly,
  adminDeleteUser
);

// ------------------------------------------------------------
// MODULE FILE UPLOADS (Admin + Tutor)
// ------------------------------------------------------------

// Upload file to a specific module
router.post(
  "/modules/:moduleId/upload",
  adminAuth,                      // allow admin + tutor
  uploadToCloud.single("file"),   // cloudinary uploader
  uploadModuleFile
);

// List all uploaded files for a module
router.get(
  "/modules/:moduleId/files",
  adminAuth,                      // allow admin + tutor
  listModuleFiles
);

export default router;
