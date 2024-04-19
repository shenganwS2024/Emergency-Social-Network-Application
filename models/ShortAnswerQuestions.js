import mongoose from 'mongoose';

const shortAnswerQuestionSchema = new mongoose.Schema({
  questionDescription: { type: String, required: true },
  correctAnswer: { type: String, required: true }
});

const ShortAnswerQuestions = mongoose.model('ShortAnswerQuestions', shortAnswerQuestionSchema);

export { ShortAnswerQuestions };
