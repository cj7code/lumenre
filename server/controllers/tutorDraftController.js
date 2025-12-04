// /server/controllers/tutorDraftController.js
import Draft from "../models/Draft.js";
import Module from "../models/Module.js";

// ============================================================================
// CREATE DRAFT (Tutor)
// ============================================================================

export const tutorCreateDraft = async (req, res) => {
  try {
    const { title, rawContent, moduleId } = req.body;

    if (!title || !moduleId) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ error: "Module not found" });

    const draft = new Draft({
      title,
      rawContent,
      module: moduleId,
      createdBy: req.user._id,
      status: "pending",
      fileUrl: req.uploadedFiles?.[0]?.url || null,
      filePublicId: req.uploadedFiles?.[0]?.public_id || null,
    });

    await draft.save();

    res.json(draft);

  } catch (err) {
    console.error("tutorCreateDraft error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================================
// LIST DRAFTS
// ============================================================================
export const tutorListDrafts = async (req, res) => {
  try {
    const drafts = await Draft.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(drafts);
  } catch (err) {
    console.error("tutorListDrafts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================================
// GET SINGLE DRAFT
// ============================================================================
export const tutorGetDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: "Draft not found" });
    res.json(draft);
  } catch (err) {
    console.error("tutorGetDraft error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ============================================================================
// PUBLISH DRAFT
// ============================================================================
export const tutorPublishDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);

    if (!draft) return res.status(404).json({ error: "Draft not found" });

    draft.status = "published";
    await draft.save();

    res.json({ message: "Draft published", draft });
  } catch (err) {
    console.error("tutorPublishDraft error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
