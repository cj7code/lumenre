// db.js
import mongoose from 'mongoose';

const connectDB = () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  mongoose.connect(uri)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1);
    });
};

export default connectDB;
