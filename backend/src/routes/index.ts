import { Router } from 'express';
import itemRoutes from './item.routes';

const router: import('express').Router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Item routes
router.use('/items', itemRoutes);

export default router;

