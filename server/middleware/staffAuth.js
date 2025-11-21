// server/middleware/staffAuth.js
// Allows: admin + tutor
// Blocks: students & unauthenticated users

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function staffAuth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = header.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");

    // Load user
    const user = await User.findById(payload.id).select("-passwordHash");
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Allow only admin + tutor
    const allowedRoles = ["admin", "tutor"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Staff access required" });
    }

    req.user = user; // attach user object
    next();

  } catch (err) {
    console.error("staffAuth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
