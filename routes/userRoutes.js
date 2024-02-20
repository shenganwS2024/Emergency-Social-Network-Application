import { validateUser, registerUser, logoutUser} from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post('/validate', validateUser);
router.post('/logout', logoutUser);
  
export default router;