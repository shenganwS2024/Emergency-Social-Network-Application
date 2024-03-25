import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date,
    
});

export default mongoose.model('Announcements', announcementSchema)