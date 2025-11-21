// Allow only tutors (not admins, not students)
export default function tutorOnly(req, res, next) {
  if (!req.user || req.user.role !== "tutor") {
    return res.status(403).json({ error: "Tutor access only" });
  }
  next();
}
