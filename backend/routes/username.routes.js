// /api/usernames/*
import { Router } from 'express';
import { checkUsername } from '../controllers/username.controller.js';
import { loadUser } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/:name', loadUser, checkUsername);

export default router;
