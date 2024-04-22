import {Messages} from '../models/Messages.js';
import {Users} from '../models/Users.js'
import {io} from '../config/serverConfig.js'
import {userRoomMap} from '../config/globalVariables.js'

async function getLatestMessagesPipeline(receiver, sender) {
    let pipeline;
    if (receiver === "public") {
        pipeline = [
            { $match: { receiver: "public" } },
            { $lookup: { from: "users", localField: "username", foreignField: "username", as: "sender_info" } },
            { $match: { "sender_info.activeness": true } },
            { $project: { sender_info: 0 } }
        ];
    } else {
        pipeline = [
            { $match: { $or: [{ username: sender, receiver: receiver }, { username: receiver, receiver: sender }] } },
            { $lookup: { from: "users", localField: "username", foreignField: "username", as: "sender_info" } },
            { $match: { "sender_info.activeness": true } },
            { $project: { sender_info: 0 } }
        ];
    }
    return Messages.aggregate(pipeline);
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
    }
}

async function updateChatCheckedForPrivateMessage(newMessage, sender, receiver) {
    if (receiver !== "public") {
        const roomName = [sender, receiver].sort().join('_');
        const users = userRoomMap[roomName];
        const newValue = users && users.includes(receiver);

        const updatedDocument = await Users.findOneAndUpdate(
            { username: receiver },
            { $set: { [`chatChecked.${roomName}`]: newValue }},
            { new: true }
        );
        io.emit("alertUpdated", { sender: sender, receiver: receiver, checked: newValue });
    }
}

async function getLatestMessages(req, res) {
    try {
        const sender = req.params.senderName;
        const receiver = req.params.receiverName;
        const messages = await getLatestMessagesPipeline(receiver, sender);
        res.status(200).json({ data: { messages } });
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Error getting messages');
    }
}

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


export { getLatestMessages, postNewMessage };