// server/middleware/adminAuth.js
// JWT verification + admin role check
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');

    // attach user info
    const user = await User.findById(payload.id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'User not found' });

    if (user.role !== 'admin' && user.role !== 'tutor') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('adminAuth error', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
