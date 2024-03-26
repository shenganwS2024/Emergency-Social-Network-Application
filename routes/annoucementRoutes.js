import { getLatestAnnouncements, postNewAnnouncement} from '../controllers/announcementController.js'
import express from 'express';
const router = express.Router();

router.get('/announcement/:pageNumber', getLatestAnnouncements);
router.post('/announcement', postNewAnnouncement);
  
export default router;