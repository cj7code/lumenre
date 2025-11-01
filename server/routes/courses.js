import express from 'express';
const router = express.Router();

import Course from '../models/Course.js';   // NOTE: add .js
import Module from '../models/Module.js';   // NOTE: add .js

// List all courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find().sort({ year: 1, semester: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get course with modules
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('modules');
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Basic create (admin-only in production; here for dev)
router.post('/', async (req, res) => {
  try {
    const { code, title, year, semester } = req.body;
    const course = await Course.create({ code, title, year, semester });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add module to course
router.post('/:id/modules', async (req, res) => {
  try {
    const { title, content } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const mod = await Module.create({ course: course._id, title, content: content || '' });
    course.modules.push(mod._id);
    await course.save();
    res.json(mod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
