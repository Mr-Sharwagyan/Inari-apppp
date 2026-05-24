import mongoose from 'mongoose';

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    console.warn('⚠️ MONGO_URI environment variable is missing.');
    console.log('🌱 INARI Server is falling back to Local JSON File Store (mockDb.js).');
    global.useMockDb = true;
    return;
  }

  try {
    mongoose.set('strictQuery', false);
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000 // Quick failure if local mongo is down
    });
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.error(`⚠️ MongoDB Connection Error: ${error.message}`);
    console.log('🌱 INARI Server is falling back to Local JSON File Store (mockDb.js).');
    global.useMockDb = true;
  }
};

export default connectDB;
