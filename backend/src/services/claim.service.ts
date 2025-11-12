import { PrismaClient } from "@prisma/client";
import { itemService } from "./item.service";
import { ItemStatus } from "../types/item.types";
import type { CreateClaimDto } from "../types/claim.types";
import { ClaimStatus as DtoClaimStatus } from "../types/claim.types";


const prisma = new PrismaClient();

export class ClaimService {
  // creates a claim for an item when user clicks message button
  // Claim starts as OPEN - notification sent to finder
  // Conversation is created when finder approves the claim
  async createClaim(itemId: string, ownerId: string): Promise<any> {
    const item = await prisma.item.findUnique({ where: { itemId } });
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
        finderId: finderId,
        status: "OPEN",
        handedOff: false,
      },
    });

    // TODO: When notification service is ready, send notification to finder
    // TODO: Notification should appear in notifications tab and messaging tab

    return claim;
  }

  // approves a claim when the finder decides the claimer is the owner
  async approveClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }

    if (claim.finderId !== finderId) {
      throw new Error("Only the finder can approve this claim");
    }

    if (claim.status !== "OPEN") {
      throw new Error("Claim is not open");
    }

    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: "ACCEPTED" },
    });

    // TODO: When messaging service is ready, uncomment and implement:
    // import { messagingService } from "./messaging.service";
    // await messagingService.createConversation(claimId, claim.claimerId, claim.finderId);

    return updatedClaim;
  }

  // denies a claim and archives the chat conversation if it exists
  async denyClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });

    if (!claim) {
      throw new Error("Claim not found");
    }
    if (claim.finderId !== finderId) {
      throw new Error("Only the finder can deny this claim");
    }
    if (claim.status !== "OPEN") {
      throw new Error("Claim is not open");
    }

    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: "DECLINED" },
    });

    // started riding some of the code here that will be added later when messaging service is ready
    // import { messagingService } from "./messaging.service";
    // await messagingService.archiveConversation(claimId);
    // Messages will be archived and not visible to users

    return updatedClaim;
  }

  // gets all claims made by a specific user
  async getClaimsByUser(userId: string): Promise<any[]> {
    const claims = await (prisma as any).claim.findMany({
      where: { claimerId: userId },
      orderBy: { createdAt: "desc" },
    });
    return claims;
  }

  // marks item as handed off by the finder after they click "handed off" button
  async markHandedOff(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });
    if (!claim) {
      throw new Error("Claim not found");
    }
    if (claim.finderId !== finderId) {
      throw new Error("Only the finder can mark item as handed off");
    }
    if (claim.status !== "ACCEPTED") {
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
    if (claim.claimerId !== claimerId) {
      throw new Error("Only the claimer can confirm receipt");
    }
    if (claim.status !== "ACCEPTED") {
      throw new Error("Claim must be accepted before confirming receipt");
    }
    if (!claim.handedOff) {
      throw new Error("Item must be handed off before confirming receipt");
    }
    await itemService.updateItemStatus(claim.itemId, ItemStatus.CLAIMED);

    // TODO: When messaging service is ready, uncomment and implement:
    // import { messagingService } from "./messaging.service";
    // await messagingService.hideConversation(claimId);
    // Messages will be hidden from both users (but not archived)

    return claim;
  }
}

export const claimService = new ClaimService();

