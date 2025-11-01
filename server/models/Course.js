// Course.js
import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  semester: { type: Number, required: true },
  modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);

export default Course;
