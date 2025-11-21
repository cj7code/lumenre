// server/controllers/adminUserController.js
// Admin user management controller (modular)
// - List users
// - Create user (admin, tutor, student)
// - Update user role
// - Delete user
//
// Uses your existing User model and bcryptjs for hashing.

import bcrypt from "bcryptjs";
import User from "../models/User.js";

/**
 * GET /api/admin/users
 * Admin-only: list all users (without password hash)
 */
export const adminListUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("adminListUsers error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

/**
 * POST /api/admin/users
 * Admin-only: create a new user (role: admin|tutor|student)
 * Body: { name, email, password, role, phone, year, semester }
 */
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role = "student", phone = "", year = 0, semester = 0 } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const validRoles = ["admin", "tutor", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash,
      role,
      year,
      semester
    });

    // Return created user (hide hash)
    const out = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      year: user.year,
      semester: user.semester,
      createdAt: user.createdAt
    };

    res.status(201).json({ message: "User created", user: out });
  } catch (err) {
    console.error("adminCreateUser error:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Admin-only: update a user's role
 * Body: { role: "admin" }
 */
export const adminUpdateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ["admin", "tutor", "student"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "Role updated", user });
  } catch (err) {
    console.error("adminUpdateUserRole error:", err);
    res.status(500).json({ error: "Failed to update role" });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Admin-only: permanently delete a user
 */
export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully", id });
  } catch (err) {
    console.error("adminDeleteUser error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};
