import {Messages} from '../models/Messages.js';
import {Users} from '../models/Users.js'
import {io} from '../config/serverConfig.js'
import {userRoomMap} from '../config/globalVariables.js'

// Function to get the latest messages from the server
async function getLatestMessages(req, res) {
    try {
        let sender = req.params.senderName;
        let receiver = req.params.receiverName;
        let messages;
        if (receiver === "public") {
            messages = await Messages.find({receiver: receiver});
        }
        else {
            messages = await Messages.find({$or: [
                { username: sender, receiver: receiver},
                { username: receiver, receiver: sender }
              ]});
        }
        
        res.status(200).json({data:{messages: messages}});
        
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Error getting messages');
    }
}

// function to post a new message to the server
async function postNewMessage(req, res) {
    const { senderName: sender, receiverName: receiver } = req.params;
    const { username, content, timestamp, status } = req.body;

    try {
        const newMessage = await saveMessage(username, content, timestamp, status, receiver);
        emitMessageBasedOnReceiver(newMessage, sender, receiver);
        await updateChatCheckedForPrivateMessage(newMessage, sender, receiver);
        res.status(201).send({ data: { message: newMessage } });
    } catch (error) {
        console.error('Error in postNewMessage:', error);
        res.status(500).send('Error saving message');
    }
}

async function saveMessage(username, content, timestamp, status, receiver) {
    const newMessage = new Messages({ username, content, timestamp, status, receiver });
    await newMessage.save();
    return newMessage;
}

function emitMessageBasedOnReceiver(newMessage, sender, receiver) {
    if (receiver === "public") {
        io.emit('chat message', newMessage);
    } else {
        const roomName = [sender, receiver].sort().join('_');
        io.emit(roomName, newMessage);
        console.log("message sent to room ", roomName);
    }
}

async function updateChatCheckedForPrivateMessage(newMessage, sender, receiver) {
    if (receiver !== "public") {
        const roomName = [sender, receiver].sort().join('_');
        let users = userRoomMap[roomName];
        let newValue = users && users.includes(receiver);
        console.log("chatchecked changed ", roomName, newValue);

        try {
            const updatedDocument = await Users.findOneAndUpdate(
                { username: receiver },
                { $set: { [`chatChecked.${roomName}`]: newValue }}, 
                { new: true }
            );
            io.emit("alertUpdated", { sender: sender, receiver: receiver, checked: newValue });
        } catch (error) {
            console.error('Error updating chatChecked:', error);
        }
    }
}


export { getLatestMessages, postNewMessage };