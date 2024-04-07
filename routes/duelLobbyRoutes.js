import { getPlayers, getDuels, postNewPlayer, postNewDuel, updateChallengeStatus, removeAPlayer, removeADuel } from '../controllers/duelLobbyController.js'
import express from 'express';
const router = express.Router();

router.get('/players/:playerName?', getPlayers);
router.get('/duels/:playerName?', getDuels);
router.post('/players/:playerName', postNewPlayer);
router.post('/duels/:challenger/:challenged', postNewDuel);
router.put('/challengeStatuses/:challenger/:challenged', updateChallengeStatus);
router.delete('/players/:playerName', removeAPlayer);
router.delete('/duels/:playerName', removeADuel);

export default router;