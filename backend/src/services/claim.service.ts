// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the claim service file"

import { PrismaClient } from "@prisma/client";
import { itemService } from "./item.service";
import { messagingService } from "./messaging.service";
import { notificationService } from "./notification.service";
import { ItemStatus } from "../types/item.types";
import { ClaimStatus } from "../types/claim.types";


const prisma = new PrismaClient();

export class ClaimService {
  // creates a claim for an item when user clicks message button
  // Claim starts as OPEN - notification sent to finder
  // Conversation is created when finder approves the claim
  async createClaim(itemId: string, ownerId: string): Promise<any> {
    const item = await (prisma as any).item.findUnique({ where: { itemId } });
    if (!item) {
      throw new Error("Item not found");
    }
    const finderId = item.userId;
    if (finderId === ownerId) {
      throw new Error("Cannot claim your own item");
    }
    // NOTE: Requires Claim model in Prisma schema with fields:
    // claimId (String @id @default(cuid()))
    // itemId (String, FK to Item)
    // claimerId (String, FK to User)
    // finderId (String, FK to User)
    // status (ClaimStatus @default(OPEN))
    // handedOff (Boolean @default(false))
    // createdAt (DateTime @default(now()))
    const claim = await (prisma as any).claim.create({
      data: {
        itemId: itemId,
        claimerId: ownerId,
        status: 'PENDING', // Database uses PENDING, code uses OPEN
      },
    });

    // Send notification to finder about the new claim
    try {
      // Get claimer's name for the notification
      const claimer = await (prisma as any).user.findUnique({
        where: { userId: ownerId },
        select: { name: true },
      });
      const claimerName = claimer?.name || "Someone";

      // Create notification message
      const notificationMessage = `${claimerName} has claimed your item: "${item.title}"`;

      // Send push notification (non-blocking - if it fails, claim still succeeds)
      try {
        await notificationService.sendPushNotification(
          finderId,
          "New Claim Request",
          notificationMessage,
          {
            type: "claim_created",
            claimId: claim.claimId,
            itemId: item.itemId,
            itemTitle: item.title,
          }
        );
      } catch (pushError) {
        // Log error but don't fail claim creation if push fails (e.g., user has no tokens)
        console.error("Failed to send push notification:", pushError);
      }

      // Store notification in database for in-app notifications tab
      try {
        await (prisma as any).notification.create({
          data: {
            userId: finderId,
            message: notificationMessage,
          },
        });
      } catch (dbError) {
        // Log error but don't fail claim creation if notification storage fails
        console.error("Failed to store notification in database:", dbError);
      }
    } catch (error) {
      // Log error but don't fail claim creation if notification process fails
      console.error("Error sending notification:", error);
    }

    // Create thread immediately so users can message right away
    const threadId = await messagingService.ensureThread(claim.claimId);

    return {
      ...claim,
      threadId,
    };
  }

  // approves a claim when the finder decides the claimer is the owner
  async approveClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
      include: { item: true },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }
    // Finder = person who has the item
    // If FOUND: item.userId has it → finder = item.userId
    // If LOST: claimer found it → finder = claimerId
    const actualFinderId = claim.item.status === 'FOUND' ? claim.item.userId : claim.claimerId;
    if (actualFinderId != finderId) {
      throw new Error("Only the finder can approve this claim");
    }
    // Database uses PENDING, code uses OPEN
    if (claim.status != ClaimStatus.OPEN && claim.status !== 'PENDING') {
      throw new Error("Claim is not open");
    }
    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: ClaimStatus.ACCEPTED },
    });
    await messagingService.ensureThread(claimId);

    // Send notification to claimer that their claim was approved
    try {
      const notificationMessage = `Your claim for "${claim.item.title}" has been approved! You can now message the finder.`;
      
      // Send push notification
      try {
        await notificationService.sendPushNotification(
          claim.claimerId,
          "Claim Approved! 🎉",
          notificationMessage,
          {
            type: "claim_approved",
            claimId: claim.claimId,
            itemId: claim.item.itemId,
            itemTitle: claim.item.title,
          }
        );
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
      }

      // Store notification in database
      try {
        await notificationService.createNotification(claim.claimerId, notificationMessage);
      } catch (dbError) {
        console.error("Failed to store notification:", dbError);
      }
    } catch (error) {
      console.error("Error sending approval notification:", error);
    }

    // Get user emails for display after approval (REQ-3.4)
    const claimer = await (prisma as any).user.findUnique({
      where: { userId: claim.claimerId },
      select: { email: true, name: true },
    });
    const finder = await (prisma as any).user.findUnique({
      where: { userId: actualFinderId },
      select: { email: true, name: true },
    });

    // Return claim with emails included
    return {
      ...updatedClaim,
      item: claim.item,
      claimerEmail: claimer?.email || null,
      finderEmail: finder?.email || null,
      claimerName: claimer?.name || null,
      finderName: finder?.name || null,
    };
  }

  // denies a claim and archives the chat conversation if it exists
  async denyClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
      include: { item: true },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }
    // Finder = person who has the item
    const actualFinderId = claim.item.status === 'FOUND' ? claim.item.userId : claim.claimerId;
    if (actualFinderId != finderId) {
      throw new Error("Only the finder can deny this claim");
    }
    // Database uses PENDING, code uses OPEN
    if (claim.status != ClaimStatus.OPEN && claim.status !== 'PENDING') {
      throw new Error("Claim is not open");
    }

    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: ClaimStatus.DECLINED },
    });

    // Archive conversation when claim is denied
    await messagingService.archiveConversation(claimId);
    // Messages will be archived and not visible to users

    // Send notification to claimer that their claim was denied
    try {
      // Get finder's name for the notification
      const finder = await (prisma as any).user.findUnique({
        where: { userId: finderId },
        select: { name: true },
      });
      const finderName = finder?.name || "The finder";

      // Create notification message
      const notificationMessage = `Your claim for "${claim.item.title}" has been declined by ${finderName}.`;

      // Send push notification (non-blocking - if it fails, claim denial still succeeds)
      try {
        await notificationService.sendPushNotification(
          claim.claimerId,
          "Claim Declined",
          notificationMessage,
          {
            type: "claim_declined",
            claimId: claim.claimId,
            itemId: claim.item.itemId,
            itemTitle: claim.item.title,
          }
        );
      } catch (pushError) {
        // Log error but don't fail claim denial if push fails (e.g., user has no tokens)
        console.error("Failed to send push notification:", pushError);
      }

      // Store notification in database for in-app notifications tab
      try {
        await notificationService.createNotification(claim.claimerId, notificationMessage);
      } catch (dbError) {
        // Log error but don't fail claim denial if notification storage fails
        console.error("Failed to store notification in database:", dbError);
      }
    } catch (error) {
      // Log error but don't fail claim denial if notification process fails
      console.error("Error sending denial notification:", error);
    }

    return updatedClaim;
  }

  // gets a claim by its ID
  // Includes user emails for display after claim approval (REQ-3.4)
  async getClaimById(claimId: string): Promise<any | null> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
      include: {
        item: true, // Include item info
      },
    });

    if (!claim) {
      return null;
    }

    // Get finderId from item (item.userId is the finder)
    const finderId = claim.item.userId;
    
    // Get user emails for display
    const claimer = await (prisma as any).user.findUnique({
      where: { userId: claim.claimerId },
      select: { email: true, name: true },
    });
    const finder = await (prisma as any).user.findUnique({
      where: { userId: finderId },
      select: { email: true, name: true },
    });

    return {
      ...claim,
      claimerEmail: claimer?.email || null,
      finderEmail: finder?.email || null,
      claimerName: claimer?.name || null,
      finderName: finder?.name || null,
    };
  }

  // gets all claims made by a specific user
  // Includes user emails for display after claim approval (REQ-3.4)
  async getClaimsByUser(userId: string): Promise<any[]> {
    const claims = await (prisma as any).claim.findMany({
      where: { claimerId: userId },
      include: {
        item: true, // Include item info
      },
      orderBy: { createdAt: "desc" },
    });

    // Add user emails to each claim
    const claimsWithEmails = await Promise.all(
      claims.map(async (claim: any) => {
        // Get finderId from item (item.userId is the finder)
        const finderId = claim.item.userId;
        
        // Get claimer and finder emails
        const claimer = await (prisma as any).user.findUnique({
          where: { userId: claim.claimerId },
          select: { email: true, name: true },
        });
        const finder = await (prisma as any).user.findUnique({
          where: { userId: finderId },
          select: { email: true, name: true },
        });

        return {
          ...claim,
          claimerEmail: claimer?.email || null,
          finderEmail: finder?.email || null,
          claimerName: claimer?.name || null,
          finderName: finder?.name || null,
        };
      })
    );

    return claimsWithEmails;
  }

  // marks item as handed off by the finder after they click "handed off" button
  async markHandedOff(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
      include: { item: true },
    });
    if (!claim) {
      throw new Error("Claim not found");
    }
    // Finder = person who has the item
    const actualFinderId = claim.item.status === 'FOUND' ? claim.item.userId : claim.claimerId;
    if (actualFinderId != finderId) {
      throw new Error("Only the finder can mark item as handed off");
    }
    if (claim.status != ClaimStatus.ACCEPTED) {
      throw new Error("Claim must be accepted before marking as handed off");
    }
    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { handedOff: true },
    });
    return updatedClaim;
  }

  // confirms receipt of item by the claimer and updates item status to CLAIMED and hides conversation from both users
  async confirmReceipt(claimId: string, claimerId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });
    if (!claim) {
      throw new Error("Claim not found");
    }
    if (claim.claimerId != claimerId) {
      throw new Error("Only the claimer can confirm receipt");
    }
    if (claim.status != ClaimStatus.ACCEPTED) {
      throw new Error("Claim must be accepted before confirming receipt");
    }
    if (!claim.handedOff) {
      throw new Error("Item must be handed off before confirming receipt");
    }
    await itemService.updateItemStatus(claim.itemId, ItemStatus.CLAIMED);

    // Hide conversation when receipt is confirmed
    await messagingService.hideConversation(claimId);

    return claim;
  }
}

export const claimService = new ClaimService();

