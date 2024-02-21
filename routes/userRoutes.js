import { validateUser, registerUser, logoutUser, UserAcknowledged} from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post('/validate', validateUser);
router.put('/logout', logoutUser);
router.put('/acknowledge', UserAcknowledged);
  
export default router;