import firstQuestionFetch from './firstQuestionFetch.js'
import secondQuestionFetch from './secondQuestionFetch.js'
import thirdQuestionFetch from './thirdQuestionFetch.js'


const getStrategy = async (number) => {
    switch (number) {
        case '1':
            return await new firstQuestionFetch().questionFetch();
        case '2':
            return await new secondQuestionFetch().questionFetch();
        case '3':
            return await new thirdQuestionFetch().questionFetch();
        default:
            throw new Error(`Invalid question number: ${number}`);
    }
}

export default getStrategy;