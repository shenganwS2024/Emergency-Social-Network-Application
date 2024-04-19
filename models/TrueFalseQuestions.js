import mongoose from 'mongoose';

const trueFalseQuestionSchema = new mongoose.Schema({
  questionDescription: { type: String, required: true },
  choices: { 
    type: [String],
    validate: [arrayLimit, '{PATH} does not have a size of 2'], // Custom validator for the array size
    required: true
  },
  correctAnswer: { type: String, required: true }
});

// Custom validation function to check the array size is exactly 2
function arrayLimit(val) {
  return val.length === 2;
}

const TrueFalseQuestions = mongoose.model('TrueFalseQuestions', trueFalseQuestionSchema);

export { TrueFalseQuestions };
