// ============================================================================
// UNIFIED DRAFT CONTROLLER  (Admin + Tutor)
// ----------------------------------------------------------------------------
// Supports:
//   ✓ Text-based drafts
//   ✓ File-based drafts (via req.uploadedFiles)
//   ✓ AI-generated drafts (sourceText)
//   ✓ Attachments (Cloudinary)
//   ✓ Structured slides (Option B)
//   ✓ Quiz sets
//   ✓ Publishing into existing or new module
//   ✓ Backward-compatible fields: createdBy, owner, module
// ============================================================================

import Draft from "../models/Draft.js";
import Module from "../models/Module.js";

// ============================================================================
// CREATE DRAFT  (text, file, or both)
// ----------------------------------------------------------------------------
// Accepts:
//   • req.body.title
//   • req.body.sourceText  (text draft)
//   • req.body.moduleId     (optional target module to attach draft)
//   • req.uploadedFiles     (from Cloudinary middleware)
// ============================================================================
export async function createDraft(req, res) {
  try {
    const { title, sourceText, moduleId } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Draft title is required" });
    }

    // Handle file uploads (multiple or none)
    const uploadedFiles = Array.isArray(req.uploadedFiles)
      ? req.uploadedFiles
      : [];

    // We store ALL file data inside attachments
    const attachments = uploadedFiles.map((file) => ({
      url: file.url,
      public_id: file.public_id,
      resource_type: file.type,
      originalName: file.originalName,
    }));

    // Create draft document
    const draft = await Draft.create({
      title,
      module: moduleId || null,
      sourceText: sourceText || "",
      notes: "",            // Filled by AI later or tutor manually
      slides: [],           // Structured slide objects later
      quizzes: [],          // AI or manual
      attachments,
      owner: req.user._id,      // Unified owner field
      createdBy: req.user._id,  // Backward compatibility
      status: "pending",
    });

    return res.json({
      success: true,
      message: "Draft created successfully",
      draft,
    });

  } catch (err) {
    console.error("CREATE DRAFT ERROR:", err);
    return res.status(500).json({ error: "Failed to create draft" });
  }
}

// ============================================================================
// LIST DRAFTS  (Admin + Tutor)
// ----------------------------------------------------------------------------
// Returns all drafts owned by the user (owner or createdBy)
// ============================================================================
export async function listDrafts(req, res) {
  try {
    const drafts = await Draft.find({
      $or: [{ owner: req.user._id }, { createdBy: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.json(drafts);
  } catch (err) {
    console.error("LIST DRAFTS ERROR:", err);
    return res.status(500).json({ error: "Failed to load drafts" });
  }
}

// ============================================================================
// GET SINGLE DRAFT
// ============================================================================
export async function getDraft(req, res) {
  try {
    const draft = await Draft.findById(req.params.id).lean();
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    // Authorize owner
    const uid = req.user._id.toString();
    if (
      draft.owner?.toString() !== uid &&
      draft.createdBy?.toString() !== uid
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    return res.json(draft);
  } catch (err) {
    console.error("GET DRAFT ERROR:", err);
    return res.status(500).json({ error: "Failed to load draft" });
  }
}

// ============================================================================
// PUBLISH DRAFT → MODULE
// ----------------------------------------------------------------------------
// Option B: Structured slides are saved as objects:
//   { title: "", content: "" }
// ============================================================================
export async function publishDraft(req, res) {
  try {
    // Load draft
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    // Authorization
    const uid = req.user._id.toString();
    if (
      draft.owner?.toString() !== uid &&
      draft.createdBy?.toString() !== uid
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Determine publish target:
    // 1) Attached to a module
    // 2) Body provides moduleId
    // 3) Else will create NEW module
    const moduleId = draft.module?.toString() || req.body.moduleId || null;
    let existingModule = null;

    if (moduleId) {
      existingModule = await Module.findById(moduleId);
      if (!existingModule) {
        return res.status(404).json({ error: "Target module not found" });
      }
    }

    // Determine course ID
    const courseId = existingModule
      ? existingModule.course
      : req.body.course;

    if (!courseId) {
      return res.status(400).json({
        error:
          "Missing course ID. Provide body.course when publishing into NEW module.",
      });
    }

    // MAIN NOTES
    const moduleContent =
      draft.notes ||
      draft.sourceText ||
      "Module content not available.";

    // STRUCTURED SLIDES
    const structuredSlides = Array.isArray(draft.slides)
      ? draft.slides.map((s) => ({
          title: s?.title || "",
          content: s?.content || "",
        }))
      : [];

    // ATTACHMENTS → Module format
    const mappedAttachments = Array.isArray(draft.attachments)
      ? draft.attachments.map((att) => ({
          url: att.url,
          public_id: att.public_id,
          type: att.resource_type || att.type || "",
          originalName: att.originalName || "",
        }))
      : [];

    const autogeneratedBlock = {
      notes: draft.notes || "",
      slides: structuredSlides,
      quiz: Array.isArray(draft.quizzes) ? draft.quizzes : [],
      metadata: draft.autogenerated || {},
    };

    let moduleDoc;

    // UPDATE EXISTING MODULE
    if (existingModule) {
      existingModule.content = (
        (existingModule.content || "") +
        "\n\n" +
        moduleContent
      ).trim();

      existingModule.autogenerated = autogeneratedBlock;
      existingModule.attachments.push(...mappedAttachments);

      await existingModule.save();
      moduleDoc = existingModule;
    }

    // CREATE NEW MODULE
    else {
      moduleDoc = await Module.create({
        course: courseId,
        title: draft.title,
        content: moduleContent,
        autogenerated: autogeneratedBlock,
        attachments: mappedAttachments,
      });
    }

    // Mark draft as published
    draft.status = "published";
    draft.publishedAt = new Date();
    await draft.save();

    return res.json({
      success: true,
      message: existingModule
        ? "Draft published and module updated."
        : "Draft published as new module.",
      module: moduleDoc,
    });

  } catch (err) {
    console.error("PUBLISH DRAFT ERROR:", err);
    return res.status(500).json({ error: "Failed to publish draft" });
  }
}

// ============================================================================
// DELETE DRAFT
// ============================================================================
export async function deleteDraft(req, res) {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ error: "Draft not found" });

    const uid = req.user._id.toString();
    if (
      draft.owner?.toString() !== uid &&
      draft.createdBy?.toString() !== uid
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await draft.deleteOne();

    return res.json({
      success: true,
      message: "Draft deleted successfully.",
    });

  } catch (err) {
    console.error("DELETE DRAFT ERROR:", err);
    return res.status(500).json({ error: "Failed to delete draft" });
  }
}
