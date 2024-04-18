import mongoose from 'mongoose';

// Define a submission schema
const submissionSchema = new mongoose.Schema({
  questionDescriptions: [{ type: String, required: true }],
  questionAnswers: [{ type: String, required: true }],
  studentAnswers: [{ type: String, required: true }]
});

// Modify the duelSchema to include an array of submission objects
const duelSchema = new mongoose.Schema({
  challengerName: { type: String, required: true, unique: true },
  challengedName: { type: String, required: true, unique: true },
  submissions: [submissionSchema]  // Array of submission objects
});

const Duels = mongoose.model('Duels', duelSchema);

export { Duels };
