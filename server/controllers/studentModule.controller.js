// ------------------------------------------------------
// STUDENT MODULE CONTROLLER
// Responsible for loading full module content for students
// INCLUDING quizzes, attachments, and readable notes
// ------------------------------------------------------

import Module from "../models/Module.js";

export const getStudentModuleById = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module = await Module.findById(moduleId)
      .populate({
        path: "quizzes",
        select: "title questions createdAt",
      })
      .lean();

    if (!module) {
      return res.status(404).json({ error: "Module not found" });
    }

    // --------------------------------------------------
    // Normalize response for frontend consumption
    // --------------------------------------------------
    res.json({
      _id: module._id,
      title: module.title,
      content: module.content || "",
      references: module.references || [],
      attachments: module.attachments || [],
      quizzes: module.quizzes || [],
      createdAt: module.createdAt,
    });
  } catch (err) {
    console.error("STUDENT MODULE LOAD ERROR:", err);
    res.status(500).json({ error: "Failed to load module content" });
  }
};
