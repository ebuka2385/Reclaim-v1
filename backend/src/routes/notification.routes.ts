import { Router } from "express";
import { notificationController } from "../controllers/notification.controller";

const router: Router = Router();

// POST /notifications/register - Register a device push token
router.post("/register", (req, res) =>
  notificationController.registerToken(req, res)
);

// POST /notifications/send - Send a custom notification
router.post("/send", (req, res) =>
  notificationController.sendNotification(req, res)
);

// DELETE /notifications/token/:token - Remove a device token
router.delete("/token/:token", (req, res) =>
  notificationController.removeToken(req, res)
);

// GET /notifications/user/:userId - Get all notifications for a user
router.get("/user/:userId", (req, res) =>
  notificationController.getNotifications(req, res)
);

// PATCH /notifications/:notifId/read - Mark notification as read
router.patch("/:notifId/read", (req, res) =>
  notificationController.markAsRead(req, res)
);

export default router;

