import mongoose from 'mongoose';

// const connectDB = async () => {
//     try {
//       await mongoose.connect('mongodb+srv://yus2:1111@fse.dty3o9p.mongodb.net/ESN', {})
//       console.log('MongoDB connected successfully');
//     } catch (error) {
//       console.error('MongoDB connection failed:', error.message);

//       process.exit(1);
//     }
//   };
  
//   export default connectDB;

  //Singleton class for database
class DBConnection {
  static instance = null;

  static async getInstance(dbUri) {
      if (!DBConnection.instance) {
          DBConnection.instance = new DBConnection();
          await DBConnection.instance.connect(dbUri);
      }
      return DBConnection.instance;
  }

  async connect(dbUri) {
      try {
          await mongoose.connect(dbUri, {});
          console.log('MongoDB connected successfully');
      } catch (error) {
          console.error('MongoDB connection failed:', error.message);
          process.exit(1);
      }
  }
}

export default DBConnection;