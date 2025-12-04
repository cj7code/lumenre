// server/routes/courses.js
// ------------------------------------------------------
// Course routes
//   - List all courses
//   - Get single course (with modules populated)
//   - List modules for a course (with attachments)
//   - Create course
//   - Create module under a course
// ------------------------------------------------------

import express from "express";
const router = express.Router();

import Course from "../models/Course.js";
import Module from "../models/Module.js";

// ------------------------------------------------------
// GET /api/courses
// List all courses
// ------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ year: 1, semester: 1 });
    res.json(courses);
  } catch (err) {
    console.error("COURSES LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load courses" });
  }
});

// ------------------------------------------------------
// GET /api/courses/:id
// Get ONE course + its modules (for overview pages)
// ------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate({
        path: "modules",
        select: "title content attachments createdAt updatedAt"
      })
      .lean();

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("COURSE DETAIL ERROR:", err);
    res.status(500).json({ error: "Failed to load course" });
  }
});

// ------------------------------------------------------
// 🔥 NEW: GET /api/courses/:id/modules
// Return ALL modules for a course (with attachments)
// Used by StudentModuleView and any selector that wants
// modules + resources.
// ------------------------------------------------------
router.get("/:id/modules", async (req, res) => {
  try {
    const courseId = req.params.id;

    // only modules under this course
    const modules = await Module.find({ course: courseId })
      .sort({ createdAt: 1 })
      .lean();

    res.json(modules);
  } catch (err) {
    console.error("COURSE MODULES LIST ERROR:", err);
    res.status(500).json({ error: "Failed to load modules" });
  }
});

// ------------------------------------------------------
// POST /api/courses
// Basic create (for seeding / admin)
// ------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { code, title, year, semester, description } = req.body;

    const course = await Course.create({
      code,
      title,
      year,
      semester,
      description: description || "",
    });

    res.json(course);
  } catch (err) {
    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// ------------------------------------------------------
// POST /api/courses/:id/modules
// Create module under a course
//  - sets module.course
//  - pushes into course.modules[]
// This is useful if you create modules from the course page.
// ------------------------------------------------------
router.post("/:id/modules", async (req, res) => {
  try {
    const courseId = req.params.id;
    const { title, content } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const mod = await Module.create({
      course: courseId,
      title,
      content: content || "",
    });

    // link to course.modules[]
    course.modules.push(mod._id);
    await course.save();

    res.json(mod);
  } catch (err) {
    console.error("ADD MODULE TO COURSE ERROR:", err);
    res.status(500).json({ error: "Failed to add module" });
  }
});

export default router;
