import SearchStrategy from './searchStrategyInterface.js'
import {findAllUsers} from '../models/Users.js';

class publicMessageSearch extends SearchStrategy {
    async search(criteria) {
        try {
            

        } catch (error) {
            console.error("Error searching public messages:", error);
            throw error;
        }
    }
}

export default publicMessageSearch;