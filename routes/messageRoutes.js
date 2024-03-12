import { getLatestMessages, postNewMessage} from '../controllers/publicChatController.js'
import { } from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.get('/messages/:senderName/:receiverName', getLatestMessages);
router.post('/messages/:senderName/:receiverName', postNewMessage);
  
export default router;