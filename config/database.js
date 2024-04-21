import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import { MultipleChoicesQuestions } from '../models/MultipleChoicesQuestions.js';
import { TrueFalseQuestions } from '../models/TrueFalseQuestions.js';
import { ShortAnswerQuestions } from '../models/ShortAnswerQuestions.js';
import { Users} from '../models/Users.js';

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
          await this.initializeQuestionsDatabase();
          await this.initializeUsersDatabase();
      } catch (error) {
          console.error('MongoDB connection failed:', error.message);
          process.exit(1);
      }
  }

  async initializeQuestionsDatabase() {
    try {
      const data = await fs.readFile('config/questions.json', 'utf8');
      const questions = JSON.parse(data);
  
      // Import multiple-choice questions
      const mcCount = await MultipleChoicesQuestions.countDocuments();
      if (mcCount === 0 && questions.multipleChoiceQuestions.length > 0) {
        await MultipleChoicesQuestions.insertMany(questions.multipleChoiceQuestions);
        console.log(`Initialized the database with ${questions.multipleChoiceQuestions.length} multiple choices questions.`);
      }
  
      // Import true/false questions
      const tfCount = await TrueFalseQuestions.countDocuments();
      if (tfCount === 0 && questions.trueFalseQuestions.length > 0) {
        await TrueFalseQuestions.insertMany(questions.trueFalseQuestions);
        console.log(`Initialized the database with ${questions.trueFalseQuestions.length} true/false questions.`);
      }
  
      // Import short answer questions
      const saCount = await ShortAnswerQuestions.countDocuments();
      if (saCount === 0 && questions.shortAnswerQuestions.length > 0) {
        await ShortAnswerQuestions.insertMany(questions.shortAnswerQuestions);
        console.log(`Initialized the database with ${questions.shortAnswerQuestions.length} short answer questions.`);
      }
    } catch (error) {
      console.error('Error initializing the questions database:', error);
    }
  }

  async initializeUsersDatabase() {
    try {
      const adminExists = await Users.findOne({ username: "ESNAdmin" });
      if (!adminExists) {
        // If not exists, create a new admin user
        const adminUser = new Users({
          username: "ESNAdmin",
          password: "admin", // Hash the password before saving
          privilege: "Administrator",
          status: [{ status: 'ok', date: new Date() }],
          activeness: true
        });

        // Save the new admin user
        await adminUser.save();
        console.log("Admin user 'ESNAdmin' added to the database.");
      }
      
    } catch (error) {
      console.error('Error initializing the Users database:', error);
    }
  }
}

export default DBConnection;
