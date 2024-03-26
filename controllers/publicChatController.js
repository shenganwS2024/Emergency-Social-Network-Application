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
async function postNewMessage(req,res) {
    let sender = req.params.senderName;
    let receiver = req.params.receiverName;
    const { username, content, timestamp,status } = req.body;
    console.log(req.body);
    try {
        const newMessage = new Messages({
            username:username,
            content:content,
            timestamp:timestamp,
            status:status,
            receiver: receiver
        });
        await newMessage.save();
        //console.log('Message saved:', newMessage);
        if (receiver === "public") {
            io.emit('chat message', newMessage)
        }
        else {
            const roomName = [sender, receiver].sort().join('_');
            io.emit(roomName, newMessage);
            console.log("message sent to room ",roomName)
            let users = userRoomMap[roomName]
            let newValue = false;
            if (users && users.includes(receiver)) {
                newValue = true;
            }
            Users.findOneAndUpdate(
                { username: receiver },
                { $set: { [`chatChecked.${roomName}`]: newValue }}, 
                { new: true }
            ).then(updatedDocument => {
                io.emit("alertUpdated", {sender: sender, receiver: receiver, checked: newValue});
                console.log('Updated document:', updatedDocument);
            }).catch(error => {
                console.error('Error updating the document:', error);
            });

        }
        res.status(201).send({data:{message: newMessage}});
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).send('Error saving message');
    }
}

export { getLatestMessages, postNewMessage };