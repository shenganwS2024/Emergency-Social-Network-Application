import {findAllAnnouncements} from '../models/Announcements.js';
import SearchStrategy from './searchStrategyInterface.js';

class announcementSearch extends SearchStrategy {
    async search(criteria) {
        try {
            let announcements = await findAllAnnouncements()

            let filteredAnnouncements = announcements.filter(announcement =>
                announcement.content.includes(criteria))

            let ret = filteredAnnouncements.map(announcement => ({
                username: announcement.username,
                content: announcement.content,
                timestamp: announcement.timestamp
            }));
            
            return ret;
            
        } catch (error) {
            console.error("Error searching public messages:", error);
            throw error;
        }
    }
}

export default announcementSearch;