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
  ): Promise<any> {
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

    return tokens.map((t) => t.token);
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
        // Extract ticket IDs (they're objects with status and id)
        ticketChunk.forEach((ticket) => {
          if (ticket.status === "ok" && ticket.id) {
            tickets.push(ticket.id);
          } else if (ticket.status === "error") {
            console.error("Push notification error:", ticket.message);
            // Handle errors (e.g., invalid token, device not registered)
            if (ticket.details?.error === "DeviceNotRegistered") {
              // Token is invalid, should remove it from database
              this.removeInvalidToken(ticket.details.expoPushToken);
            }
          }
        });
      } catch (error) {
        console.error("Error sending push notifications:", error);
        throw new Error("Failed to send push notifications");
      }
    }

    return tickets;
  }

  /**
   * Sends a test notification to a user
   * This is a convenience method for testing
   * @param userId - The user ID
   * @returns Array of ticket IDs
   */
  async sendTestNotification(userId: string): Promise<string[]> {
    return this.sendPushNotification(
      userId,
      "Test Notification",
      "This is a test notification from Reclaim! 🎉",
      {
        type: "test",
        timestamp: new Date().toISOString(),
      }
    );
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
      console.log(`Removed invalid token: ${token.substring(0, 20)}...`);
    } catch (error) {
      // Token might already be deleted, ignore
      console.error("Error removing invalid token:", error);
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

