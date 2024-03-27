import { switchDatabase, checkSpeedTestMode } from '../controllers/switchStateController.js'
import express from 'express';
const router = express.Router();

router.post('/speedTest', switchDatabase);
router.get('/speedTest', checkSpeedTestMode);

export default router;
