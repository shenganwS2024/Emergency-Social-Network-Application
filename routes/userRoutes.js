import { validateUser, registerUser, logoutUser, UserAcknowledged, getUser, getOneStatus, updateOneStatus, updateChatChecked, updateProfile} from '../controllers/userController.js'
import { updateContact, updateAddress, getOneAddress, deleteAddress, deleteContact } from '../controllers/emergencyContactController.js';
import express from 'express';
const router = express.Router();

router.post('/registration', registerUser);
router.post('/login', validateUser); 
router.put('/logout', logoutUser);
router.put('/acknowledgement', UserAcknowledged);
router.put('/users/profile/:username', updateProfile);
router.get('/users', getUser);
router.get('/status/:username', getOneStatus);
router.get('/address/:username',getOneAddress);
router.put('/status/:username', updateOneStatus);
router.put('/alert/:active_username/:passive_username/:join_or_leave', updateChatChecked);
router.put('/contacts/:username', updateContact);
router.put('/address/:username',updateAddress);
router.delete('/address/:username',deleteAddress);
router.delete('/contacts/:username', deleteContact);
  
export default router;