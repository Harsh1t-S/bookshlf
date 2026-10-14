// /api/books
import { Router } from 'express';
import { search } from '../controllers/books.controller.js';
import { requireUser } from '../middleware/auth.middleware.js';
import { rateLimit } from '../middleware/rateLimit.middleware.js';

const router = Router();

// Only the signed-in "Add your books" step searches, so the API isn't an open proxy to Open Library.
router.get('/search', requireUser, rateLimit({ limit: 30, windowMs: 60_000 }), search);

export default router;
