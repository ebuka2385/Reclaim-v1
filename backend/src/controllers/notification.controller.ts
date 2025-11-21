import { Request, Response } from "express";
import { notificationService } from "../services/notification.service";

export class NotificationController {
  /**
   * POST /notifications/register
   * Registers a device push token for a user
   * Body: { userId: string, token: string, platform?: string }
   */
  async registerToken(req: Request, res: Response): Promise<void> {
    try {
      const { userId, token, platform } = req.body;

      if (!userId || !token) {
        res.status(400).json({
          error: "Missing required fields: userId, token",
        });
        return;
      }

      const deviceToken = await notificationService.registerDeviceToken(
        userId,
        token,
        platform || "ios"
      );

      res.status(201).json({
        message: "Device token registered successfully",
        deviceToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid Expo push token")) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to register device token" });
        }
      } else {
        res.status(500).json({ error: "Failed to register device token" });
      }
    }
  }

  /**
   * POST /notifications/test/:userId
   * Sends a test push notification to a user
   * This is for testing purposes only
   */
  async sendTestNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({ error: "Missing required parameter: userId" });
        return;
      }

      const tickets = await notificationService.sendTestNotification(userId);

      res.json({
        message: "Test notification sent successfully",
        tickets,
        count: tickets.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no registered device tokens")) {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to send test notification" });
        }
      } else {
        res.status(500).json({ error: "Failed to send test notification" });
      }
    }
  }

  /**
   * POST /notifications/send
   * Sends a custom push notification to a user
   * Body: { userId: string, title: string, body: string, data?: object }
   */
  async sendNotification(req: Request, res: Response): Promise<void> {
    try {
      const { userId, title, body, data } = req.body;

      if (!userId || !title || !body) {
        res.status(400).json({
          error: "Missing required fields: userId, title, body",
        });
        return;
      }

      const tickets = await notificationService.sendPushNotification(
        userId,
        title,
        body,
        data
      );

      res.json({
        message: "Notification sent successfully",
        tickets,
        count: tickets.length,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("no registered device tokens")) {
          res.status(404).json({ error: error.message });
        } else {
          res.status(500).json({ error: "Failed to send notification" });
        }
      } else {
        res.status(500).json({ error: "Failed to send notification" });
      }
    }
  }

  /**
   * DELETE /notifications/token/:token
   * Removes a device token (e.g., on logout)
   */
  async removeToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: "Missing required parameter: token" });
        return;
      }

      await notificationService.removeDeviceToken(token);

      res.json({ message: "Device token removed successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove device token" });
    }
  }
}

export const notificationController = new NotificationController();

