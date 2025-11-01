// User.js - User details
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor', 'admin'], default: 'student' },
  year: { type: Number }, // 1,2,3
  semester: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

export default User;
