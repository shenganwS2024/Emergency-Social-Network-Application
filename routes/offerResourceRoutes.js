import express from 'express';
import { submitResourceOffer, getAllResourceNeeds } from '../controllers/resourceOfferController.js';

const router = express.Router();

router.post('/resourceOffers', submitResourceOffer);
router.get('/resourceNeeds', getAllResourceNeeds);


export default router;