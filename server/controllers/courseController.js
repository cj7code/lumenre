// controllers/courseController.js
import Course from '../models/Course.js';

// ADMIN - ADD COURSE
export const createCourse = async (req, res) => {
  try {
    const { title, description, year, semester } = req.body;
    const course = await Course.create({ title, description, year, semester });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COURSES
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ year: 1, semester: 1 });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE COURSE
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
