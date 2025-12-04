// tutorModuleUploadController.js
import Module from "../models/Module.js";
import cloudinary from "../config/cloudinary.js";

// Detect type
function getType(mime) {
  if (!mime) return "raw";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  return "raw";
}

// ============================================================================
// UPLOAD
// ============================================================================
export const tutorUploadFile = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    if (!req.uploadedFiles || req.uploadedFiles.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    req.uploadedFiles.forEach((file) => {
      module.attachments.push({
        url: file.url,
        public_id: file.public_id,
        type: file.type,
        originalName: file.originalName,
        uploadedBy: req.user._id,
        uploadedAt: new Date(),
        downloads: 0,
      });
    });

    await module.save();

    res.json({ message: "Uploaded", files: module.attachments });

  } catch (err) {
    console.error("tutorUploadFile error:", err);
    res.status(500).json({ error: "Internal error" });
  }
};

// ============================================================================
// LIST
// ============================================================================
export const tutorListModuleFiles = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    res.json(module.attachments);
  } catch (err) {
    console.error("list error:", err);
    res.status(500).json({ error: "Internal error" });
  }
};

// ============================================================================
// DELETE
// ============================================================================
export const tutorDeleteFile = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    const publicId = decodeURIComponent(req.params.publicId);

    const file = module.attachments.find((f) => f.public_id === publicId);
    if (!file) return res.status(404).json({ error: "File not found" });

    const type = getType(file.type);

    await cloudinary.uploader.destroy(publicId, { resource_type: type });

    module.attachments = module.attachments.filter(
      (f) => f.public_id !== publicId
    );

    await module.save();
    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("delete error:", err);
    res.status(500).json({ error: "Internal error" });
  }
};

// ============================================================================
// DOWNLOAD REDIRECT + COUNTER
// ============================================================================
export const tutorDownloadFile = async (req, res) => {
  try {
    console.log("TUTOR DOWNLOAD HIT:", req.params);

    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    const publicId = decodeURIComponent(req.params.publicId);

    const file = module.attachments.find((f) => f.public_id === publicId);
    if (!file) return res.status(404).json({ error: "File not found" });

    file.downloads += 1;
    await module.save();

    const type = getType(file.type);
    const redirectUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_NAME}/${type}/upload/${publicId}`;

    res.redirect(redirectUrl);

  } catch (err) {
    console.error("download error:", err);
    res.status(500).json({ error: "Internal error" });
  }
};
