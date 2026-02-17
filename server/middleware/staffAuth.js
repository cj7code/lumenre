// ============================================================================
// STAFF AUTH MIDDLEWARE
// ---------------------------------------------------------------------------
// Purpose:
// - Allows access ONLY to staff users (admin + tutor)
// - Blocks students and unauthenticated users
// - Attaches authenticated staff user to req.user
//
// Used by:
// - Admin routes
// - Tutor routes
// - Any protected staff-only endpoint
// ============================================================================

import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function staffAuth(req, res, next) {
  try {
    // ------------------------------------------------------------------------
    // 1. Extract Authorization header
    //    Supports both lowercase and uppercase header keys
    // ------------------------------------------------------------------------
    const header = req.headers.authorization || req.headers.Authorization;

    // No token present → reject immediately
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    // ------------------------------------------------------------------------
    // 2. Extract JWT token from "Bearer <token>"
    // ------------------------------------------------------------------------
    const token = header.split(" ")[1];

    // Verify token signature and expiry
    // Uses environment secret (fallback only for dev)
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");

    // ------------------------------------------------------------------------
    // 3. Load user from database
    //    - Password hash explicitly excluded
    // ------------------------------------------------------------------------
    const user = await User.findById(payload.id).select("-passwordHash");

    // Token valid but user no longer exists
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // ------------------------------------------------------------------------
    // 4. Role-based access control
    //    - Only admin and tutor are allowed
    //    - Students are explicitly blocked
    // ------------------------------------------------------------------------
    const allowedRoles = ["admin", "tutor"];
    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Staff access required" });
    }

    // ------------------------------------------------------------------------
    // 5. Attach authenticated user to request
    //    - Available in controllers as req.user
    // ------------------------------------------------------------------------
    req.user = user;

    // Continue to the protected route
    next();

  } catch (err) {
    // ------------------------------------------------------------------------
    // Token verification errors:
    // - Invalid token
    // - Expired token
    // - Malformed token
    // ------------------------------------------------------------------------
    console.error("staffAuth error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
