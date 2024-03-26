import SearchStrategy from './searchStrategyInterface.js'
import {findAllUsers} from '../models/Users.js';

class UserNameSearch extends SearchStrategy {
    async search(criteria) {
        try {
            let allUsers = await findAllUsers();
            // Filter users based on criteria
            const filteredUsers = allUsers.filter(user =>
                user.username.includes(criteria)
            );
            return filteredUsers.map(user => user.username);
        } catch (error) {
            console.error("Error searching user names:", error);
            throw error;
        }
    }
}

export default UserNameSearch;