// /api/goodreads
import { Router } from 'express';
import { importShelves } from '../controllers/goodreads.controller.js';

const router = Router();

router.get('/', importShelves);

export default router;
