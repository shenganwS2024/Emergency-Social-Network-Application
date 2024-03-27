import {Announcements} from '../models/Announcements.js';
import { io } from '../server.js';

// Function to get the latest messages from the server
async function getLatestAnnouncements(req, res) {
    
    try {
        let page = req.params.pageNumber;      
        let announcements = await Announcements.find({});
        let ret;
        console.log("page ", page)
        if (page === '0') {
            console.log("page 0");
            ret = announcements;
        }
        else {
            page = + page  //string to int
            if (!isNaN(page) && page > 0) {
                const itemsPerPage = 10;
                const startIndex = (page - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                ret = announcements.slice(startIndex, endIndex);
            } else {
                // Handle invalid page number (e.g., non-numeric or negative)
                ret = []; // or any other fallback logic you prefer
            }
        }
        console.log("anything ", ret)
        
        res.status(200).json({data:{announcements: ret}});
        
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).send('Error getting messages');
    }
}

// function to post a new message to the server
async function postNewAnnouncement(req,res) {
    const { username, content, timestamp } = req.body;
    console.log(req.body);
    try {
        const newAnnouncement = new Announcements({
            username:username,
            content:content,
            timestamp:timestamp
        });
        await newAnnouncement.save();
        io.emit('new announcement', newAnnouncement);
        

        res.status(201).send({data:{announcement: newAnnouncement}});
    } catch (error) {
        console.error('Error saving announcement:', error);
        res.status(500).send('Error saving message');
    }
}

export { getLatestAnnouncements, postNewAnnouncement };