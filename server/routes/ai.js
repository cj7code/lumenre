// server/routes/ai.js
// ---------------------------------------------------------------------------
// AI routes
// - Wraps the central generateStub worker
// - Returns structured: { notes, slides, quizzes } or a subset
// ---------------------------------------------------------------------------

import express from "express";
const router = express.Router();

import generateStub from "../worker/generateStub.js";
import Module from "../models/Module.js";

// POST /api/ai/generate
// Body: { prompt, moduleId? }
// Returns: { notes, slides, quizzes }
router.post("/generate", async (req, res) => {
  try {
    const { prompt, moduleId } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "prompt is required" });
    }

    let moduleMeta = null;
    if (moduleId) {
      moduleMeta = await Module.findById(moduleId)
        .populate("course", "title")
        .lean()
        .catch(() => null);
    }

    const input = {
      prompt,
      moduleId: moduleId || null,
      moduleTitle: moduleMeta?.title || null,
      courseTitle: moduleMeta?.course?.title || null,
      wantNotes: true,
      wantSlides: true,
      wantQuizzes: true,
    };

    const generated = await generateStub(null, input);

    return res.json({
      success: true,
      from: generated.lastProvider || "ai",
      notes: generated.notes || "",
      slides: generated.slides || [],
      quizzes: generated.quizzes || [],
    });
  } catch (err) {
    console.error("AI /generate error:", err);
    return res.status(500).json({ error: "AI generation failed" });
  }
});

export default router;
