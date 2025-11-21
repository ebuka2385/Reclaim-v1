import { Router } from "express";
import itemRoutes from "./item.routes";
import claimRoutes from "./claim.routes";
import messagingRoutes from "./messaging.routes";
import authRoutes from "./auth.routes";
import notificationRoutes from "./notification.routes";

// Will import all other routes here when created

const router: Router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Auth routes
router.use('/auth', authRoutes);

// Item routes
router.use('/items', itemRoutes);

// Claim routes
router.use('/claims', claimRoutes);

// Messaging routes
router.use("/messages", messagingRoutes);

// Notification routes
router.use("/notifications", notificationRoutes);

export default router;

