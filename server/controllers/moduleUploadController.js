// server/controllers/moduleUploadController.js
// ------------------------------------------------------
// Allows Admin/Tutor to upload teaching materials
// directly into a specific module (PDF, DOCX, PPT, JPG, etc.)
// ------------------------------------------------------

import Module from "../models/Module.js";
import cloudinary from "../config/cloudinary.js";

// Upload a single file to a module
export const uploadModuleFile = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // Ensure attachments array exists
    if (!module.attachments) module.attachments = [];

    // Save uploaded file metadata
    module.attachments.push({
      url: req.file.path,
      public_id: req.file.filename,
      type: req.file.mimetype,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    });

    await module.save();

    res.json({
      message: "File uploaded successfully.",
      file: {
        url: req.file.path,
        public_id: req.file.filename,
        type: req.file.mimetype,
      },
      module,
    });

  } catch (err) {
    console.error("uploadModuleFile error:", err);
    res.status(500).json({ error: err.message });
  }
};

// List module attachments
export const listModuleFiles = async (req, res) => {
  try {
    const moduleId = req.params.moduleId;

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    res.json(module.attachments || []);
  } catch (err) {
    console.error("listModuleFiles error:", err);
    res.status(500).json({ error: err.message });
  }
};
