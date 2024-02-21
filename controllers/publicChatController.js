import Messages from '../models/Messages.js';
//import {io} from '../server.js'


// Function to get the latest messages from the server
async function getLatestMessages(req, res) {
    try {
        let messages = await Messages.find({});
        
        res.status(200).json({data:{messages: messages}});
        
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Error getting messages');
    }
}

// function to post a new message to the server
async function postNewMessage(req,res) {
    const { username, content, timestamp,status } = req.body;
    console.log(req.body);
    try {
        const newMessage = new Messages({
            username:username,
            content:content,
            timestamp:timestamp,
            status:status
        });
        console.log(newMessage);
        
        io.emit('chat message',newMessage)
        await newMessage.save();
        console.log('Message saved:', newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
    }
}

export { getLatestMessages, postNewMessage };