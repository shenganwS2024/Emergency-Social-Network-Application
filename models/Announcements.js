import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date,
    
});

let Announcements = mongoose.model('Announcements', announcementSchema)

async function findAllAnnouncements() {
    try {
        const announcements = await Announcements.find({});
        return announcements;
    } catch (error) {
        // Handle or throw the error according to your application's needs
        console.error("Error fetching announcements:", error);
        throw error;
    }
  }
export { Announcements, findAllAnnouncements };