// server/middleware/uploadToCloud.js
// ============================================================================
// FINAL UNIVERSAL UPLOAD MIDDLEWARE
// Prevents Safari/Chrome auto-download for PDFs
// Ensures inline preview works by:
//   ✓ Using resource_type: "raw" for non-images
//   ✓ Removing Cloudinary’s hidden 'attachment' flag
//   ✓ Supporting both "file" and "files"
// ============================================================================

import multer from "multer";
import { v4 as uuid } from "uuid";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// -----------------------------
// 1) Multer memory storage
// -----------------------------
const storage = multer.memoryStorage();

// Accept both old & new upload formats
const uploader = multer({ storage }).fields([
  { name: "file", maxCount: 1 },
  { name: "files", maxCount: 10 },
]);

// -----------------------------
// 2) Select Cloudinary resource type
// -----------------------------
function detectResourceType(mimetype) {
  if (!mimetype) return "raw";

  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";

  // PDFs, DOCX, XLSX, PPT, ZIP, RAR, EPUB, etc.
  return "raw";
}

// -----------------------------
// 3) Upload Buffer → Cloudinary Stream
// -----------------------------
function uploadBufferToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const resourceType = detectResourceType(mimetype);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "lumenre_uploads",
        resource_type: resourceType,

        // Critical: This disables Cloudinary's forced attachment behavior
        type: "upload",
        flags: [],

        public_id: uuid(),
        use_filename: true,
        unique_filename: false,
      },
      (err, result) => {
        if (err) {
          console.error("Cloudinary Upload Error:", err);
          return reject(err);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// -----------------------------
// 4) Main Middleware
// -----------------------------
export default function uploadToCloud(req, res, next) {
  uploader(req, res, async (err) => {
    if (err) {
      console.error("❌ Multer error:", err);
      return res.status(400).json({ error: "Upload failed", details: err });
    }

    const normalizedFiles = [
      ...(req.files?.file || []),
      ...(req.files?.files || []),
    ];

    // Allow AI/tutor/admin draft creation with NO files
    if (normalizedFiles.length === 0) {
      req.uploadedFiles = [];
      return next();
    }

    try {
      const uploadedFiles = [];

      for (const file of normalizedFiles) {
        const uploaded = await uploadBufferToCloudinary(file.buffer, file.mimetype);

        uploadedFiles.push({
          url: uploaded.secure_url,      // inline-preview-safe raw URL
          public_id: uploaded.public_id,
          type: file.mimetype,
          originalName: file.originalname,
        });
      }

      req.uploadedFiles = uploadedFiles;
      next();
    } catch (error) {
      console.error("❌ Cloudinary Final Error:", error);
      res.status(500).json({ error: "Cloudinary upload failed" });
    }
  });
}
