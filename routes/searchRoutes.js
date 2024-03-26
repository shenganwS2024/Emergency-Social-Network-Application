import { getSearchResults } from '../controllers/searchController.js'
import express from 'express';
const router = express.Router();

router.get('/search/:context/:criteria/:pageNumber', getSearchResults);

export default router;