import {getQuestion, getResult, uploadSubmission, updateReadiness} from '../controllers/duelGameController.js'
import express from 'express';
const router = express.Router();

router.get('/questions/:number', getQuestion);
router.get('/results/:playerName', getResult);
router.put('/submissions/:playerName', uploadSubmission);
router.put('/readyStatuses/:playerName', updateReadiness);


export default router;