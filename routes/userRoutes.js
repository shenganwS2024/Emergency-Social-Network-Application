import { validateUser, registerUser, logoutUser, UserAcknowledged, getUser, getOneStatus, updateOneStatus, updateChatChecked} from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/registration', registerUser);
router.post('/login', validateUser);
router.put('/logout', logoutUser);
router.put('/acknowledgement', UserAcknowledged);
router.get('/users', getUser);
router.get('/status/:username', getOneStatus);
router.put('/status/:username', updateOneStatus);
router.put('/alert/:active_username/:passive_username/:join_or_leave', updateChatChecked);
  
export default router;