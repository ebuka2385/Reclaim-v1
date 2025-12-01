// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the notification service file"


import { Expo } from "expo-server-sdk";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a new Expo SDK client
const expo = new Expo();

export class NotificationService {
  /**
   * Registers or updates a device push token for a user
   * @param userId - The user ID
   * @param token - The Expo push token from the device
   * @param platform - Platform type ("ios" or "android")
   * @returns The device token record
   */
  async registerDeviceToken(
    userId: string,
    token: string,
    platform: string = "ios"
  ): Promise<{ tokenId: string; userId: string; token: string; platform: string; createdAt: Date; updatedAt: Date }> {
    // Validate token format (Expo tokens start with ExponentPushToken or ExponentsPushToken)
    if (!Expo.isExpoPushToken(token)) {
      throw new Error("Invalid Expo push token format");
    }

    // Check if token already exists for this user
    const existingToken = await prisma.deviceToken.findUnique({
      where: { token },
    });

    if (existingToken) {
      // Update if it belongs to a different user, or update platform if same user
      if (existingToken.userId !== userId) {
        // Token belongs to different user, update it
        return prisma.deviceToken.update({
          where: { token },
          data: {
            userId,
            platform,
          },
        });
      } else {
        // Same user, just update platform if needed
        return prisma.deviceToken.update({
          where: { token },
          data: { platform },
        });
      }
    }

    // Create new token
    return prisma.deviceToken.create({
      data: {
        userId,
        token,
        platform,
      },
    });
  }

  /**
   * Gets all device tokens for a user
   * @param userId - The user ID
   * @returns Array of device tokens
   */
  async getUserDeviceTokens(userId: string): Promise<string[]> {
    const tokens = await prisma.deviceToken.findMany({
      where: { userId },
      select: { token: true },
    });

    return tokens.map((t: { token: string }) => t.token);
  }

  /**
   * Sends a push notification to a user
   * @param userId - The user ID to send notification to
   * @param title - Notification title
   * @param body - Notification body/message
   * @param data - Optional data payload
   * @returns Array of ticket IDs from Expo
   */
  async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<string[]> {
    // Get all device tokens for the user
    const tokens = await this.getUserDeviceTokens(userId);

    if (tokens.length === 0) {
      throw new Error("User has no registered device tokens");
    }

    // Create messages for each token
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default" as const,
      title,
      body,
      data: data || {},
    }));

    // Send notifications in chunks (Expo allows up to 100 at a time)
    const chunks = expo.chunkPushNotifications(messages);
    const tickets: string[] = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        ticketChunk.forEach((ticket: { status: string; id?: string; message?: string; details?: { error?: string; expoPushToken?: string } }) => {
          if (ticket.status === "ok" && ticket.id) {
            tickets.push(ticket.id);
          } else if (ticket.status === "error") {
            if (ticket.details?.error === "DeviceNotRegistered" && ticket.details?.expoPushToken) {
              this.removeInvalidToken(ticket.details.expoPushToken);
            }
          }
        });
      } catch (error) {
        throw new Error("Failed to send push notifications");
      }
    }

    return tickets;
  }

  /**
   * Creates a notification in the database (for in-app notifications)
   * @param userId - The user ID to notify
   * @param message - The notification message
   * @returns The created notification
   */
  async createNotification(userId: string, message: string): Promise<any> {
    return prisma.notification.create({
      data: {
        userId,
        message,
      },
    });
  }

  /**
   * Gets all notifications for a user
   * @param userId - The user ID
   * @returns Array of notifications
   */
  async getNotificationsByUser(userId: string): Promise<any[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  }

  /**
   * Marks a notification as read
   * @param notifId - The notification ID
   * @returns The updated notification
   */
  async markNotificationAsRead(notifId: string): Promise<any> {
    return prisma.notification.update({
      where: { notifId },
      data: { read: true },
    });
  }

  /**
   * Removes an invalid token from the database
   * Called when Expo reports a token as invalid
   * @param token - The invalid token
   */
  private async removeInvalidToken(token: string): Promise<void> {
    try {
      await prisma.deviceToken.delete({
        where: { token },
      });
    } catch (error) {
      // Token might already be deleted, ignore
    }
  }

  /**
   * Removes a device token (e.g., when user logs out on a device)
   * @param token - The token to remove
   */
  async removeDeviceToken(token: string): Promise<void> {
    await prisma.deviceToken.delete({
      where: { token },
    });
  }
}

export const notificationService = new NotificationService();
