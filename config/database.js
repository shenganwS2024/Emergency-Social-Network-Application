import mongoose from 'mongoose';

class DBConnection {
  static instance = null;
  static currentDbUri = '';

  static async getInstance(dbUri) {
      // if an instance exists and if the new uri equals the current one
      if (!DBConnection.instance || DBConnection.currentDbUri !== dbUri) {
          if (DBConnection.instance) {
              // disconnect the current instance if it exists
              await mongoose.disconnect();
              console.log('Disconnected from the current database');
          }
          // connect to the new one
          DBConnection.instance = new DBConnection();
          await DBConnection.instance.connect(dbUri);
          // Update the currentDbUri
          DBConnection.currentDbUri = dbUri; 
      }
      return DBConnection.instance;
  }

    static async dropDatabase() {
        if (DBConnection.instance) {
            await mongoose.connection.dropDatabase();
            console.log('Database dropped');
        }
    }

  async connect(dbUri) {
      try {
          await mongoose.connect(dbUri, {});
          console.log(`MongoDB connected successfully to ${dbUri}`);
      } catch (error) {
          console.error('MongoDB connection failed:', error.message);
          process.exit(1);
      }
  }
}

export default DBConnection;
