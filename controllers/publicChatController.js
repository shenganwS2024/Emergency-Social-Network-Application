import {Messages} from '../models/Messages.js';
import {Users} from '../models/Users.js'
import {io} from '../config/serverConfig.js'
import {userRoomMap} from '../config/globalVariables.js'

// Function to get the latest messages from the server
async function getLatestMessages(req, res) {
    try {
        const sender = req.params.senderName;
        const receiver = req.params.receiverName;
        let pipeline;

        if (receiver === "public") {
            // Aggregate pipeline to filter out inactive users for public messages
            pipeline = [
                {
                    $match: { receiver: "public" }
                },
                {
                    $lookup: {
                        from: "users", // Adjust this to your actual collection name as per MongoDB
                        localField: "username",
                        foreignField: "username",
                        as: "sender_info"
                    }
                },
                {
                    $match: { "sender_info.activeness": true }
                },
                {
                    $project: {
                        sender_info: 0 // Exclude sender_info from the output
                    }
                }
            ];
        } else {
            // Aggregate pipeline for private messages filtering inactive users
            pipeline = [
                {
                    $match: {
                        $or: [
                            { username: sender, receiver: receiver },
                            { username: receiver, receiver: sender }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: "users", // Adjust this to your actual collection name as per MongoDB
                        localField: "username",
                        foreignField: "username",
                        as: "sender_info"
                    }
                },
                {
                    $match: { "sender_info.activeness": true }
                },
                {
                    $project: {
                        sender_info: 0 // Exclude sender_info from the output
                    }
                }
            ];
        }

        const messages = await Messages.aggregate(pipeline);

        res.status(200).json({ data: { messages } });
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