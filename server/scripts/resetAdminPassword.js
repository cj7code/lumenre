// server/scripts/resetAdminPassword.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

// 🔧 Change these to match your admin details
const ADMIN_EMAIL = 'cjcode777@gmail.com';
const NEW_PASSWORD = 'password123';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mernapp';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    const newHash = await bcrypt.hash(NEW_PASSWORD, 12);
    user.passwordHash = newHash;
    await user.save();

    console.log(`✅ Password for ${ADMIN_EMAIL} has been reset to "${NEW_PASSWORD}"`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error resetting password:', err.message);
    process.exit(1);
  }
})();
