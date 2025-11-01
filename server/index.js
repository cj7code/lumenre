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
app.use(cors());
app.use(express.json({ limit: '2mb' }));

connectDB();

app.get('/', (req, res) => res.send({ ok: true, service: 'Lumenre API' }));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/admin', adminRoutes);

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
