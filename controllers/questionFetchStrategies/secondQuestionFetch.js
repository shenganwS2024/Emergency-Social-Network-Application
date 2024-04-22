import { TrueFalseQuestions } from '../../models/TrueFalseQuestions.js';
import QuestionFetchStrategy from './questionFetchStrategyInterface.js';

class secondQuestionFetch extends QuestionFetchStrategy {
    async questionFetch() {
        try {
            const count = await TrueFalseQuestions.countDocuments();
            const random = Math.floor(Math.random() * count);
            const randomQuestion = await TrueFalseQuestions.findOne().skip(random);
            return randomQuestion;
        } catch (error) {
            console.error('Error fetching a random true/false question:', error);
            throw error;  
        }
    }
}

export default secondQuestionFetch;
