import { MultipleChoicesQuestions } from '../../models/MultipleChoicesQuestions.js';
import QuestionFetchStrategy from './questionFetchStrategyInterface.js';

class firstQuestionFetch extends QuestionFetchStrategy {
    async questionFetch() {
        try {
            const count = await MultipleChoicesQuestions.countDocuments();
            const random = Math.floor(Math.random() * count);
            const randomQuestion = await MultipleChoicesQuestions.findOne().skip(random);
            return randomQuestion;
        } catch (error) {
            console.error('Error fetching a random multiple choices question:', error);
            throw error;  
        }
    }
}

export default firstQuestionFetch;
