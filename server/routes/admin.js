// server/routes/admin.js
// ------------------------------------------------------------
// Admin & Tutor-level content routes + Admin-only user management
// ------------------------------------------------------------

import express from 'express';
import { staffAuth } from '../middleware/staffAuth.js';   // JWT + allow admin/tutor
import adminOnly from "../middleware/adminOnly.js";       // STRICT admin only
import { uploadModuleFile, listModuleFiles } from "../controllers/moduleUploadController.js";

import {
  uploadToCloud,
  createDraft,
  listDrafts,
  getDraft,
  publishDraft
} from '../controllers/adminController.js';

import {
  adminListUsers,
  adminCreateUser,
  adminUpdateUserRole,
  adminDeleteUser
} from "../controllers/adminUserController.js";

const router = express.Router();

// ------------------------------------------------------------
// PART 1: DRAFT & COURSE MANAGEMENT (Admin + Tutor)
// ------------------------------------------------------------

router.post(
  '/drafts',
  staffAuth,                     // allow admin + tutor
  uploadToCloud.single('file'),
  createDraft
);

router.get(
  '/drafts',
  staffAuth,                     
  listDrafts
);

router.get(
  '/drafts/:id',
  staffAuth,                     
  getDraft
);

router.post(
  '/drafts/:id/publish',
  staffAuth,                     
  publishDraft
);

// ------------------------------------------------------------
// PART 2: USER MANAGEMENT (ADMIN ONLY)
// ------------------------------------------------------------

router.get(
  "/users",
  staffAuth,                     
  adminOnly,                    
  adminListUsers
);

router.post(
  "/users",
  staffAuth,
  adminOnly,
  adminCreateUser
);

router.put(
  "/users/:id/role",
  staffAuth,
  adminOnly,
  adminUpdateUserRole
);

router.delete(
  "/users/:id",
  staffAuth,
  adminOnly,
  adminDeleteUser
);

// ------------------------------------------------------------
// MODULE FILE UPLOADS (Admin + Tutor)
// ------------------------------------------------------------

router.post(
  "/modules/:moduleId/upload",
  staffAuth,
  uploadToCloud.single("file"),
  uploadModuleFile
);

router.get(
  "/modules/:moduleId/files",
  staffAuth,
  listModuleFiles
);

export default router;
