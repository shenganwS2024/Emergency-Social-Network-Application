import mongoose from 'mongoose';

const connectDB = async () => {
    try {
      await mongoose.connect('mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESN', {})
      console.log('MongoDB connected successfully');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);

      process.exit(1);
    }
  };
  
  export default connectDB;