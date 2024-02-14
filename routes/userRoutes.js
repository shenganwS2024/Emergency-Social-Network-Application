import { validateUser, registerUser } from '../controllers/userController.js'
import express from 'express';
const router = express.Router();

router.post('/register', registerUser);
router.post('/validate', validateUser);
  
export default router;