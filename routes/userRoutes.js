import { validateUser, registerUser, logoutUser, UserAcknowledged, getUser} from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/registration', registerUser);
router.post('/login', validateUser);
router.put('/logout', logoutUser);
router.put('/acknowledgement', UserAcknowledged);
router.get('/users', getUser);
  
export default router;