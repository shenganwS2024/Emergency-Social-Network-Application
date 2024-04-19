import { ShortAnswerQuestions } from '../models/ShortAnswerQuestions.js';
import QuestionFetchStrategy from './questionFetchStrategyInterface.js';

class thirdQuestionFetch extends QuestionFetchStrategy {
    async questionFetch() {
        try {
            const count = await ShortAnswerQuestions.countDocuments();
            const random = Math.floor(Math.random() * count);
            const randomQuestion = await ShortAnswerQuestions.findOne().skip(random);
            return randomQuestion;
        } catch (error) {
            console.error('Error fetching a random short answer question:', error);
            throw error;  
        }
    }
}

export default thirdQuestionFetch;
