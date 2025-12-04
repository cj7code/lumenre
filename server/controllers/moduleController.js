// server/controllers/moduleController.js
// -------------------------------------------------------
// Handles module creation + listing modules for a course
// Attachments are included so students can see notes
// -------------------------------------------------------

import Module from "../models/Module.js";

// Create a module/topic under a course
export const createModule = async (req, res) => {
  try {
    const { courseId, title, content } = req.body;

    const Module = (await import("../models/Module.js")).default;
    const Course = (await import("../models/Course.js")).default;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const mod = await Module.create({
      title,
      content,
      course: courseId,
    });

    // 🔥 IMPORTANT: Link module to course
    course.modules.push(mod._id);
    await course.save();

    res.json(mod);
  } catch (err) {
    console.error("CREATE MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to create module" });
  }
};

// List all modules under a course (attachments INCLUDED)
export const listModulesByCourse = async (req, res) => {
  try {
    const Module = (await import("../models/Module.js")).default;

    const modules = await Module.find({ course: req.params.courseId })
      .lean(); // includes attachments

    res.json(modules);
  } catch (err) {
    console.error("LIST MODULES BY COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
};

