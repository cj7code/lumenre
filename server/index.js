import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';  // <-- Added to handle Safari zstd bug
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import courseRoutes from './routes/courses.js';
import quizRoutes from './routes/quizzes.js';
import adminRoutes from './routes/admin.js';

const app = express();

/* --------------------------------------------------------
   FIX: Safari / iPhone "zstd" compression bug
   --------------------------------------------------------
   - Safari 17+ requests "zstd" compression by default
   - Render's NGINX does NOT support zstd
   - Render closes the connection → Axios timeout
   - This middleware strips zstd to prevent silent failures
--------------------------------------------------------- */
app.use((req, res, next) => {
  const enc = req.headers["accept-encoding"];
  if (enc && enc.includes("zstd")) {
    req.headers["accept-encoding"] = "gzip, deflate, br"; // remove zstd safely
  }
  next();
});

/* --------------------------------------------------------
   Optional improved compression (safe for Render)
--------------------------------------------------------- */
app.use(
  compression({
    level: 6,
    filter: (req, res) => {
      // Don't try to compress if Safari sent zstd (we already removed it)
      return compression.filter(req, res);
    },
  })
);

/* --------------------------------------------------------
   CORS FIX — REQUIRED FOR VERCEL FRONTEND + RENDER BACKEND
--------------------------------------------------------- */
app.use(
  cors({
    origin: [
      "http://localhost:5173",        // local development
      "https://lumenre.vercel.app",   // production frontend
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

// Required to handle OPTIONS preflight properly
app.options("/api/*", cors());

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
