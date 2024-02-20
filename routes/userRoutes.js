import { validateUser, registerUser, logoutUser, UserAcknowledged} from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post('/validate', validateUser);
router.post('/logout', logoutUser);
router.post('/acknowledge', UserAcknowledged);
  
export default router;