// Allow only tutors (not admins, not students)
export default function tutorOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  if (req.user.role !== "tutor") {
    return res.status(403).json({ error: "Tutor access only" });
  }

  next();
}

