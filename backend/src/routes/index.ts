import { Router } from "express";
import itemRoutes from "./item.routes";
import claimRoutes from "./claim.routes";
import messagingRoutes from "./messaging.routes";

// Will import all other routes here when created

const router: Router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Item routes
router.use('/items', itemRoutes);

// Claim routes
router.use('/claims', claimRoutes);

// Messaging routes
router.use("/messages", messagingRoutes);

export default router;

