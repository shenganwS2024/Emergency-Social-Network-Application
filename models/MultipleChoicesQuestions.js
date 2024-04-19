import mongoose from 'mongoose';

const multipleChoicesQuestionSchema = new mongoose.Schema({
  questionDescription: { type: String, required: true },
  choices: { 
    type: [String],
    validate: [arrayLimit, '{PATH} does not have a size of 4'], // Custom validator for the array size
    required: true
  },
  correctAnswer: { type: String, required: true }
});

// Custom validation function to check the array size is exactly 4
function arrayLimit(val) {
  return val.length === 4;
}

const MultipleChoicesQuestions = mongoose.model('MultipleChoicesQuestions', multipleChoicesQuestionSchema);

export { MultipleChoicesQuestions };
