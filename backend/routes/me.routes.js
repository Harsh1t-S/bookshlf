// /api/me/*
import { Router } from 'express';
import * as me from '../controllers/me.controller.js';
import { loadUser, requireUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', loadUser, me.getAccount);
router.put('/shelf', requireUser, me.saveShelf);
router.put('/username', requireUser, me.claimUsername);

export default router;
