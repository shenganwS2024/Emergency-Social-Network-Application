import express from 'express';
import { reportResourceNeed, updateResourceNeedQuantity, getNotificationsForUser, deleteNotification } from '../controllers/resourceNeedController.js';

const router = express.Router();

router.post('/resourceNeeds', reportResourceNeed);
router.put('/resourceNeeds/:needId', updateResourceNeedQuantity);
router.get('/notifications/:username', getNotificationsForUser);
router.delete('/notifications/:notificationId', deleteNotification);

export default router;