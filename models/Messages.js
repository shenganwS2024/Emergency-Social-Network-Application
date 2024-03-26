import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: Date,
    status: String,
    // new added field for chat privately
    receiver: String,
});
let Messages = mongoose.model('Messages', messageSchema);

async function findMessages(sender=null, receiver=null) {
    try {
        let messages;
        if (receiver && sender) {
            messages = await Messages.find({$or: [
                { username: sender, receiver: receiver},
                { username: receiver, receiver: sender }
              ]});
        }
        else {
            messages = await Messages.find({receiver: "public"});
        }
        return messages;
    } catch (error) {
        // Handle or throw the error according to your application's needs
        console.error("Error fetching messages:", error);
        throw error;
    }
  }

export { Messages, findMessages};