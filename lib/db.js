import mongoose from 'mongoose';

export async function connectDB() {
  console.log('MONGODB_URI value:', JSON.stringify(process.env.MONGODB_URI));
  console.log('MONGODB_URI type:', typeof process.env.MONGODB_URI);

  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.log('MongoDB connection error:', err);
  }
}
