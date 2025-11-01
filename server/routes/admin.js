// server/routes/admin.js
import express from 'express';
import { adminAuth } from '../middleware/adminAuth.js';
import {
  uploadToCloud,
  createDraft,
  listDrafts,
  getDraft,
  publishDraft
} from '../controllers/adminController.js';

const router = express.Router();

// Upload single file and create draft -> generate content
router.post('/drafts', adminAuth, uploadToCloud.single('file'), createDraft);

// List drafts
router.get('/drafts', adminAuth, listDrafts);

// Get a draft
router.get('/drafts/:id', adminAuth, getDraft);

// Publish draft
router.post('/drafts/:id/publish', adminAuth, publishDraft);

export default router;
