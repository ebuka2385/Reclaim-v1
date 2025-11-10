import { PrismaClient } from '@prisma/client';
import type { CreateClaimDto } from '../types/claim.types';
import { ClaimStatus as DtoClaimStatus } from '../types/claim.types';

const prisma = new PrismaClient();

export class ClaimService {
  // creates a claim for an item and enables messaging between claimer and finder
  async createClaim(itemId: string, ownerId: string): Promise<any> {
    const item = await prisma.item.findUnique({ where: { itemId } });
    if (!item) {
      throw new Error('Item not found');
    }

    const finderId = item.userId;
    if (finderId === ownerId) {
      throw new Error('Cannot claim your own item');
    }

    // NOTE: Requires Claim model in Prisma schema with fields:
    // claimId (String @id @default(cuid()))
    // itemId (String, FK to Item)
    // claimerId (String, FK to User)
    // finderId (String, FK to User)
    // status (ClaimStatus @default(OPEN))
    // createdAt (DateTime @default(now()))
    const claim = await (prisma as any).claim.create({
      data: {
        itemId: itemId,
        claimerId: ownerId,
        finderId: finderId,
        status: 'OPEN',
      },
    });

    // TODO: When messaging service is ready, uncomment and implement:
    // import { messagingService } from './messaging.service';
    // await messagingService.createConversation(claim.claimId, ownerId, finderId);

    return claim;
  }

  // approves a claim when the finder decides the claimer is the owner
  async approveClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.finderId !== finderId) {
      throw new Error('Only the finder can approve this claim');
    }

    if (claim.status !== 'OPEN') {
      throw new Error('Claim is not open');
    }

    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: 'ACCEPTED' },
    });

    return updatedClaim;
  }

  // denies a claim and clears the chat conversation
  async denyClaim(claimId: string, finderId: string): Promise<any> {
    const claim = await (prisma as any).claim.findUnique({
      where: { claimId },
    });

    if (!claim) {
      throw new Error('Claim not found');
    }

    if (claim.finderId !== finderId) {
      throw new Error('Only the finder can deny this claim');
    }

    if (claim.status !== 'OPEN') {
      throw new Error('Claim is not open');
    }

    const updatedClaim = await (prisma as any).claim.update({
      where: { claimId },
      data: { status: 'DECLINED' },
    });

    // TODO: When messaging service is ready, uncomment and implement:
    // import { messagingService } from './messaging.service';
    // await messagingService.deleteConversation(claimId);

    return updatedClaim;
  }
}

export const claimService = new ClaimService();

