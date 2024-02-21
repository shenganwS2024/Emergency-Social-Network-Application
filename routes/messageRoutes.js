import { getLatestMessages, postNewMessage} from '../controllers/publicChatController.js'
import { } from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.get('/messages', getLatestMessages);
router.post('/messages', postNewMessage);
  
export default router;