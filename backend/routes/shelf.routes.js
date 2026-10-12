// /api/shelves/*
import { Router } from 'express';
import { getPublicShelf } from '../controllers/shelf.controller.js';

const router = Router();

router.get('/:username', getPublicShelf);

export default router;
