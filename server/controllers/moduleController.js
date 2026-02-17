// server/controllers/moduleController.js
// -------------------------------------------------------
// Handles module creation + listing + metadata update
// -------------------------------------------------------

import Module from "../models/Module.js";

/* ------------------------------------------------------------------
   CREATE MODULE (unchanged – working logic)
------------------------------------------------------------------ */
export const createModule = async (req, res) => {
  try {
    const { courseId, title, content } = req.body;

    const Course = (await import("../models/Course.js")).default;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    const mod = await Module.create({
      title,
      content,
      course: courseId,
    });

    // Link module to course
    course.modules.push(mod._id);
    await course.save();

    res.json(mod);
  } catch (err) {
    console.error("CREATE MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to create module" });
  }
};

/* ------------------------------------------------------------------
   LIST MODULES BY COURSE (unchanged – working logic)
------------------------------------------------------------------ */
export const listModulesByCourse = async (req, res) => {
  try {
    const modules = await Module.find({ course: req.params.courseId }).lean();
    res.json(modules);
  } catch (err) {
    console.error("LIST MODULES ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
};

/* ------------------------------------------------------------------
   UPDATE MODULE METADATA (NEW)
   - Used by ModuleCreator.jsx when renaming modules
   - DOES NOT touch module content
------------------------------------------------------------------ */
export const updateModule = async (req, res) => {
  try {
    const { title, courseId } = req.body;

    const updated = await Module.findByIdAndUpdate(
      req.params.moduleId,
      {
        ...(title && { title }),
        ...(courseId && { course: courseId }),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json({ module: updated });
  } catch (err) {
    console.error("UPDATE MODULE ERROR:", err);
    res.status(500).json({ error: "Failed to update module" });
  }
};
