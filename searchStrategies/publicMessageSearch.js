import SearchStrategy from './searchStrategyInterface.js'
import {findMessages} from '../models/Messages.js';

class publicMessageSearch extends SearchStrategy {
    async search(criteria) {
        try {
            let messages = await findMessages(receiver = "public");
            let filteredMessages = messages.filter(message => message.content.includes(criteria));
            let ret = filteredMessages.map(message => ({
                username: message.username,
                content: message.content,
                timestamp: message.timestamp,
                status: message.status,
            }));

            return ret

        } catch (error) {
            console.error("Error searching public messages:", error);
            throw error;
        }
    }
}

export default publicMessageSearch;