import { ResourceNeeds } from '../models/ResourceNeeds.js';
import { io } from '../config/serverConfig.js'
import { userNotificationMap } from '../config/globalVariables.js'
import { Users } from '../models/Users.js'
import { Notification } from '../models/Notifications.js'
import { findUsernameById } from '../models/ResourceNeeds.js';

const validateResourceNeed = async (resourceType, quantity, urgencyLevel, otherResourceType) => {
        const errors = [];
        
        if (!resourceType) {
                errors.push('Resource type is required');
        }
        
        if (!quantity || isNaN(quantity) || quantity < 1) {
                errors.push('Quantity is invalid');
        }
        
        if (!urgencyLevel) {
                errors.push('Urgency level is required');
        }
        
        if (resourceType === 'Other' && !otherResourceType) {
                errors.push('Other resource type is required');
        }
        
        return errors;
}



async function reportResourceNeed(req, res) {
    try {
        const { userId, resourceType, quantity, urgencyLevel, otherResourceType } = req.body;

        const errors = await validateResourceNeed(resourceType, quantity, urgencyLevel, otherResourceType);

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        const username = await findUsernameById(userId);

        const newNeed = await ResourceNeeds.create({
            userId,
            username,
            resourceType,
            quantity,
            urgencyLevel,
            otherResourceType,
            totalQuantityNeeded: quantity,
            quantityFulfilled: 0,
            progress: 0,
        });

        io.emit('newNeed', newNeed); 

        res.status(201).json({ data: { resourceNeed: newNeed } });
    } catch (error) {
        console.error("Error reporting resource need:", error);
        res.status(500).send("An error occurred", error.message);
    }
}

const notifyUserOfResourceOffer = (username, offerDetails) => {
    const socketId = userNotificationMap.get(username);
    if (socketId) {
        io.to(socketId).emit('resourceOfferNotification', offerDetails);
    } 
};


async function updateResourceNeedQuantity(req, res) {
    try {
        const { needId } = req.params;
        const { offeredQuantity, sender } = req.body;
        const resourceNeed = await ResourceNeeds.findById(needId);
        if (!resourceNeed) {
            return res.status(404).json({ message: 'Resource need not found.' });
        }

        resourceNeed.quantityFulfilled += Number(offeredQuantity);
        resourceNeed.progress = (resourceNeed.quantityFulfilled / resourceNeed.totalQuantityNeeded) * 100;
        resourceNeed.quantity = resourceNeed.totalQuantityNeeded - resourceNeed.quantityFulfilled;

        if (resourceNeed.progress > 100) {
            return res.status(400).json({ message: 'This need has already been fulfilled.', resourceNeed });
        }

        await ResourceNeeds.updateOne(
            { _id: resourceNeed._id },
            { 
                $set: { 
                    quantityFulfilled: resourceNeed.quantityFulfilled, 
                    progress: resourceNeed.progress, 
                    quantity: resourceNeed.quantity 
                } 
            }
        );        

        const user = await Users.findById(resourceNeed.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const username = user.username; 

        const newNotification = new Notification({
            receiverUsername: username,
            senderUsername: sender,
            resourceNeedId: needId,
            offeredQuantity: req.body.offeredQuantity,
            resourceType: resourceNeed.resourceType,
          });

        await newNotification.save();

        notifyUserOfResourceOffer(username, newNotification); 

        res.status(200).json({ message: 'Resource need updated successfully', resourceNeed });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

async function getNotificationsForUser(req, res) {
    try {
      const { username } = req.params;
      const notifications = await Notification.find({ receiverUsername: username }).sort({ createdAt: -1 });
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

async function deleteNotification(req, res) {
    try {
        const { notificationId } = req.params;
        await Notification.deleteOne({ _id: notificationId });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export { reportResourceNeed, updateResourceNeedQuantity, getNotificationsForUser, deleteNotification };
