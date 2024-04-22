import SearchStrategy from './searchStrategyInterface.js'
import {findAllUsers} from '../../models/Users.js';

class statusSearch extends SearchStrategy {
    async search(criteria) {
        try {
            let allUsers = await findAllUsers();
            let matchedUsers = allUsers.filter(user => {
                // Check if user has status entries
                if (user.status && user.status.length > 0) {
                    // Sort the statuses by date descending to find the latest
                    const latestStatus = user.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                    // Compare the latest status with the criteria
                    return latestStatus.status === criteria;
                }
                return false;
            }).map(user => {
                // Return user information along with their latest status
                const latestStatus = user.status.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                return {
                    username: user.username,
                    status: latestStatus.status,
                    date: latestStatus.date,
                    onlineStatus: user.onlineStatus
                };
            });

            return matchedUsers;

        } catch (error) {
            console.error("Error searching user status:", error);
            throw error;
        }
    }
}

export default statusSearch;