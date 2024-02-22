import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date,
    status: String
});

export default mongoose.model('Messages', messageSchema)