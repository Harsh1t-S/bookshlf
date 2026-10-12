// Every API endpoint, mounted under /api by app.js.
import { Router } from 'express';
import authRoutes from './auth.routes.js';
import goodreadsRoutes from './goodreads.routes.js';
import meRoutes from './me.routes.js';
import shelfRoutes from './shelf.routes.js';
import usernameRoutes from './username.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/usernames', usernameRoutes);
router.use('/shelves', shelfRoutes);
router.use('/goodreads', goodreadsRoutes);

export default router;
