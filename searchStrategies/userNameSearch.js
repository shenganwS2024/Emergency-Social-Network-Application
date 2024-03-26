import SearchStrategy from './searchStrategyInterface.js'
import {findAllUsers} from '../models/Users.js';

class UserNameSearch extends SearchStrategy {
    async search(criteria) {
        try {
            let allUsers = await findAllUsers();
            // Filter users based on criteria
            const filteredUsers = allUsers.filter(user =>
                user.username.includes(criteria)
            ).map(user => {
                return {
                    username: user.username,
                    status: user.status,
                    onlineStatus: user.onlineStatus
                };
            });

            return filteredUsers;
            //Example return: [
            //     {
            //         username: "johnDoe",
            //         status: "active",
            //         onlineStatus: true
            //     },
            //     {
            //         username: "janeDoe",
            //         status: "busy",
            //         onlineStatus: false
            //     }
            // ]

        } catch (error) {
            console.error("Error searching user names:", error);
            throw error;
        }
    }
}

export default UserNameSearch;