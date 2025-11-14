import express from 'express';
const router = express.Router();

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // NOTE the .js at the end

// =======================
// Sign Up
// =======================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, year, semester, phone } = req.body;
    if (!email || !password || !name)
      return res.status(400).json({ error: 'Name, email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      passwordHash,
      year,
      semester,
      phone
    });

    // Create token with name + role included
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '7d' }
    );

    // Send token + user info
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Login
// =======================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password required' });

    // Find user in DB
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Validate password
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res.status(401).json({ error: 'Invalid credentials' });

    // Create JWT including name + role
    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev',
      { expiresIn: '7d' }
    );

    // Send token + user details
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// Export router (ES Modules)
// =======================
export default router;
