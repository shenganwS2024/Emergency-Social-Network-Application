import mongoose from 'mongoose';
import { MultipleChoicesQuestions } from '../models/MultipleChoicesQuestions.js';
import { TrueFalseQuestions } from '../models/TrueFalseQuestions.js';
import { ShortAnswerQuestions } from '../models/ShortAnswerQuestions.js';

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
      } catch (error) {
          console.error('MongoDB connection failed:', error.message);
          process.exit(1);
      }
  }

  async initializeQuestionsDatabase() {
    try {
      let count = await MultipleChoicesQuestions.countDocuments();
      if (count === 0) {
        const defaultQuestion = new MultipleChoicesQuestions({
          questionDescription: 'Considering fire disaster preparedness, which of the following is the most effective action to take when you detect a fire has started in your home, and you\'ve already ensured that all occupants are alerted?',
          choices: [
            'Attempt to extinguish the fire immediately with water, regardless of the fire\'s nature.',
            'Gather valuables and personal documents before evacuating the premises.',
            'Use an appropriate fire extinguisher on the fire, if it\'s small and contained, after ensuring a clear evacuation path.',
            'Open all doors and windows to ventilate smoke and facilitate easier fire suppression for firefighters.'
          ],
          correctAnswer: 'Use an appropriate fire extinguisher on the fire, if it\'s small and contained, after ensuring a clear evacuation path.'
        });
        await defaultQuestion.save();
        console.log('Initialized the database with a default multiple choices question.');
      }

      count = await TrueFalseQuestions.countDocuments();
      if (count === 0) {
        const defaultQuestion = new TrueFalseQuestions({
          questionDescription: 'You should immediately turn on the gas supply to check if it is working after a natural disaster',
          choices: [
            'True',
            'False'
          ],
          correctAnswer: 'False'
        });
        await defaultQuestion.save();
        console.log('Initialized the database with a default true/false question.');
      }

      count = await ShortAnswerQuestions.countDocuments();
      if (count === 0) {
        const defaultQuestion = new ShortAnswerQuestions({
          questionDescription: 'What is the number of repeated signals (e.g., blasts of a whistle, flashes of light) considered a universal distress signal in emergency situations? (Answer with numbers only, no words)',
          correctAnswer: '3'
        });
        await defaultQuestion.save();
        console.log('Initialized the database with a default short answer question.');
      }
    } catch (error) {
      console.error('Error initializing the questions database:', error);
    }
  }
}

export default DBConnection;
