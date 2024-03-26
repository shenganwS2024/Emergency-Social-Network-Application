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
                const latestStatus = user.status && user.status.length > 0
                    ? user.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0].status
                    : 'undefined'; // Or any other default status
                return {
                    username: user.username,
                    status: latestStatus,
                    onlineStatus: user.onlineStatus
                };
            });
            console.log("username search",filteredUsers)

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