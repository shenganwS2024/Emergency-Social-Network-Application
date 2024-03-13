import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date,
    status: String,
    // new added field for chat privately
    receiver: String,
    // read: {
    //     type: Boolean,
    //     default: false,
    // }
});

export default mongoose.model('Messages', messageSchema)