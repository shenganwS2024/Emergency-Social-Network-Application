import { switchDatabase } from '../controllers/switchStateController.js'
import express from 'express';
const router = express.Router();

router.post('/speedTest', switchDatabase);

export default router;
