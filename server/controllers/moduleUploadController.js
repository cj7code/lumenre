// ============================================================================
// MODULE FILE UPLOAD CONTROLLER
// Handles:
//   • Attachments for a Module (admin & tutor)
//   • Uses req.uploadedFiles[] from uploadToCloud
//   • Proper delete (Cloudinary + Mongo)
//   • Download counter (no redirect, just increments)
// ============================================================================

import Module from "../models/Module.js";
import cloudinary from "../config/cloudinary.js";

// Decide Cloudinary resource_type for delete
function getResourceType(mime) {
  if (!mime) return "raw";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

// ------------------------------------------------------------------
// Upload files to a module
// ------------------------------------------------------------------
export const uploadModuleFile = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    if (!module.attachments) module.attachments = [];

    // Save each uploaded file into module.attachments
    req.uploadedFiles.forEach((file) => {
      module.attachments.push({
        url: file.url,
        public_id: file.public_id,
        type: file.type,
        originalName: file.originalName,
        uploadedBy: req.user?._id,
        uploadedAt: new Date(),
        downloads: 0,
      });
    });

    await module.save();

    return res.json({
      message: "Files uploaded successfully",
      files: module.attachments,
    });
  } catch (err) {
    console.error("uploadModuleFile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ------------------------------------------------------------------
// List all module attachments
// ------------------------------------------------------------------
export const listModuleFiles = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    return res.json(module.attachments || []);
  } catch (err) {
    console.error("listModuleFiles error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ------------------------------------------------------------------
// Delete a module file (Cloudinary + MongoDB)
// ------------------------------------------------------------------
export const deleteModuleFile = async (req, res) => {
  try {
    const { moduleId, publicId } = req.params;

    const decodedPublicId = decodeURIComponent(publicId);

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    const file = module.attachments.find(
      (f) => f.public_id === decodedPublicId
    );
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const resourceType = getResourceType(file.type);

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(decodedPublicId, {
      resource_type: resourceType,
    });

    // Remove from Mongo
    module.attachments = module.attachments.filter(
      (f) => f.public_id !== decodedPublicId
    );
    await module.save();

    return res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("deleteModuleFile error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ------------------------------------------------------------------
// Increment download counter (NO redirect)
// Frontend will open file.url directly.
// ------------------------------------------------------------------
export const incrementDownload = async (req, res) => {
  try {
    const { moduleId, publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const module = await Module.findById(moduleId);
    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    const file = module.attachments.find(
      (f) => f.public_id === decodedPublicId
    );
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    file.downloads = (file.downloads || 0) + 1;
    await module.save();

    return res.json({ downloads: file.downloads });
  } catch (err) {
    console.error("incrementDownload error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
