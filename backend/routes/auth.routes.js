// /api/auth/*
import { Router } from 'express';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/signup', auth.signup);
router.post('/login', auth.login);
router.post('/google', auth.google);
router.post('/logout', auth.logout);
router.post('/forgot', auth.forgotPassword);
router.post('/reset', auth.resetPassword);

export default router;
