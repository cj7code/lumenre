// server/scripts/createAdmin.js
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lumere');

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await User.create({
    name: 'Admin User',
    email: 'cjcode777@gmail.com',
    phone: '260976508708',
    passwordHash,
    role: 'admin',
    year: 0,
    semester: 0,
  });

  console.log('✅ Admin created:', admin);
  await mongoose.disconnect();
}

createAdmin();
