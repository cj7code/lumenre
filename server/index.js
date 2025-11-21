import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import quizRoutes from './routes/quizzes.js';
import adminRoutes from './routes/admin.js';

const app = express();

/* --------------------------------------------------------
   CORS FIX — REQUIRED FOR VERCEL FRONTEND + RENDER BACKEND
   --------------------------------------------------------
   - Render REQUIRES explicit allowed origins
   - Vercel frontend will be blocked without this
   - Using a wildcard (*) causes CORS preflight to fail
   - Connection closes → Axios timeout (your exact error)
--------------------------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",       // local development
      "https://lumenre.vercel.app",  // your deployed Vercel frontend
    ],
    credentials: true,
  })
);

// Parse JSON
app.use(express.json({ limit: '2mb' }));

// Connect to MongoDB
connectDB();

// Health check
app.get('/', (req, res) => res.send({ ok: true, service: 'Lumenre API' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

// Server listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
