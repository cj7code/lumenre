// controllers/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * ============================
 *   REGISTER USER CONTROLLER
 * ============================
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔍 Check if a user with this email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    // 🔐 Hash the user's password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🏗️ Create and save the new user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role, // role can be: "admin", "tutor", "student"
    });

    // 🎉 Success response
    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    // ❌ Unexpected server error
    res.status(500).json({ message: error.message });
  }
};

/**
 * ============================
 *       LOGIN USER
 * ============================
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // 🔑 Compare password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid credentials' });

    // 🧾 Generate JWT (includes user ID + role)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 🎉 Successful login
    // Frontend can use `user.role` to redirect to the correct dashboard
    res.status(200).json({
      message: `Login successful. You are logged in as ${user.role}`,
      token,
      user,
    });
  } catch (error) {
    // ❌ Unexpected error
    res.status(500).json({ message: error.message });
  }
};
