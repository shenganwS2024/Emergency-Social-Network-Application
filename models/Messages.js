import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date
});

export default mongoose.model('Messages', messageSchema)