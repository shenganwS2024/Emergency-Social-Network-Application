import {Announcements} from '../models/Announcements.js';
import {Users} from '../models/Users.js'
import { io } from '../server.js';

// Function to get the latest messages from the server
async function getLatestAnnouncements(req, res) {
    try {
        let page = req.params.pageNumber;
        console.log("page ", page);

        // Aggregate pipeline to filter out announcements from inactive users
        let pipeline = [
            {
                $lookup: {
                    from: 'users', 
                    localField: 'username',
                    foreignField: 'username',
                    as: 'user_details'
                }
            },
            {
                $match: {
                    'user_details.activeness': true
                }
            },
            {
                $project: {
                    user_details: 0 // We don't want to return user details in the response
                }
            }
        ];

        let announcements = await Announcements.aggregate(pipeline);
        let ret;

        if (page === '0') {
            console.log("page 0");
            ret = announcements;
        } else {
            page = +page; // string to int
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

        res.status(200).json({data: {announcements: ret}});
    } catch (error) {
        console.error('Error getting announcements:', error);
        res.status(500).send('Error getting announcements');
    }
}

// function to post a new message to the server
async function postNewAnnouncement(req,res) {
    const { username, content, timestamp } = req.body;

    // add a checker to ensure tht user's privlege level is coordinator or higher
    const user = await Users.findOne({  username: username });
    if (user.privilege !== 'Coordinator' && user.privilege !== 'Administrator') {
        res.status(403).send('User does not have the privilege to post announcements');
        return;
    }

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