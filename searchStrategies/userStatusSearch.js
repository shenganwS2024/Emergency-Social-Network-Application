import SearchStrategy from './searchStrategyInterface.js'

class statusSearch extends SearchStrategy {
    async search(criteria) {
        try {
            console.log("aloha")

        } catch (error) {
            console.error("Error searching user status:", error);
            throw error;
        }
    }
}

export default statusSearch;