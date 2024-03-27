import SearchStrategy from './searchStrategyInterface.js'
import {findMessages} from '../models/Messages.js';
import {findStatuses} from '../models/Users.js';

class privateMessageSearch extends SearchStrategy {
    async search(criteria, sender = null, receiver = null) {
        try {
            if (criteria === 'status') {
                let statuses = await findStatuses(receiver);
                let filteredStatuses = statuses.filter(status => status.status !== 'undefined');
                return filteredStatuses;
            }


            let messages = await findMessages(sender, receiver);
            
            let filteredMessages = messages.filter(message => message.content.includes(criteria));
            let ret = filteredMessages.map(message => ({
                username: message.username,
                content: message.content,
                timestamp: message.timestamp,
                status: message.status,
            }));
            

            return ret

            

        } catch (error) {
            console.error("Error searching private messages:", error);
            throw error;
        }
    }
}

export default privateMessageSearch;