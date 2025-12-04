// server/middleware/userAuth.js
import jwt from "jsonwebtoken";

export function userAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save user data for the request
    req.user = decoded;

    // Allow only logged-in users:
    if (!decoded.role) {
      return res.status(403).json({ error: "Invalid user role" });
    }

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
