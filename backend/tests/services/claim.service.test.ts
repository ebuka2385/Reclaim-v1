import { prisma } from '../../__mocks__/prismaclient';
import { ClaimStatus } from '../../src/types/claim.types';
import { ItemStatus } from '../../src/types/item.types';

// Mock Prisma Client before importing services
jest.mock('@prisma/client', () => {
  const mockPrisma = require('../../__mocks__/prismaclient').prisma;
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock itemService
jest.mock('../../src/services/item.service', () => ({
  itemService: {
    updateItemStatus: jest.fn(),
  },
}));

// Mock messagingService
jest.mock('../../src/services/messaging.service', () => ({
  messagingService: {
    ensureThread: jest.fn(),
    archiveConversation: jest.fn(),
    hideConversation: jest.fn(),
  },
}));

// Import services after mocking
import { claimService } from '../../src/services/claim.service';
import { itemService } from '../../src/services/item.service';
import { messagingService } from '../../src/services/messaging.service';

describe('ClaimService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CST-1: createClaim', () => {
    it('should successfully create a claim for a found item', async () => {
      const itemId = 'found-item-id';
      const ownerId = 'owner-user-id';
      const finderId = 'finder-user-id';

      const mockItem = {
        itemId,
        title: 'Found Phone',
        description: 'iPhone found on campus',
        status: ItemStatus.FOUND,
        userId: finderId,
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      const mockClaim = {
        claimId: 'new-claim-id',
        itemId,
        claimerId: ownerId,
        finderId,
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prisma.claim.create as jest.Mock).mockResolvedValue(mockClaim);

      const result = await claimService.createClaim(itemId, ownerId);

      expect(result).toEqual(mockClaim);
      expect(result.status).toBe(ClaimStatus.OPEN);
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { itemId },
      });
      expect(prisma.claim.create).toHaveBeenCalledWith({
        data: {
          itemId,
          claimerId: ownerId,
          finderId,
          status: ClaimStatus.OPEN,
          handedOff: false,
        },
      });
    });

    it('should throw error when item does not exist', async () => {
      const itemId = 'non-existent-item';
      const ownerId = 'owner-user-id';

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(claimService.createClaim(itemId, ownerId)).rejects.toThrow(
        'Item not found'
      );

      expect(prisma.claim.create).not.toHaveBeenCalled();
    });

    it('should throw error when user tries to claim their own item', async () => {
      const itemId = 'my-item-id';
      const userId = 'same-user-id';

      const mockItem = {
        itemId,
        title: 'My Item',
        description: 'Description',
        status: ItemStatus.FOUND,
        userId, // Same user is both finder and claimer
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);

      await expect(claimService.createClaim(itemId, userId)).rejects.toThrow(
        'Cannot claim your own item'
      );

      expect(prisma.claim.create).not.toHaveBeenCalled();
    });
  });

  describe('CST-2: approveClaim', () => {
    it('should successfully approve a claim by the finder', async () => {
      const claimId = 'pending-claim-id';
      const finderId = 'finder-user-id';
      const claimerId = 'claimer-user-id';
      const itemId = 'item-id';

      const mockClaim = {
        claimId,
        itemId,
        claimerId,
        finderId,
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      const mockUpdatedClaim = {
        ...mockClaim,
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.claim.update as jest.Mock).mockResolvedValue(mockUpdatedClaim);
      (messagingService.ensureThread as jest.Mock).mockResolvedValue('thread-id');

      const result = await claimService.approveClaim(claimId, finderId);

      expect(result.status).toBe(ClaimStatus.ACCEPTED);
      expect(prisma.claim.findUnique).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.claim.update).toHaveBeenCalledWith({
        where: { claimId },
        data: { status: ClaimStatus.ACCEPTED },
      });
      expect(messagingService.ensureThread).toHaveBeenCalledWith(claimId);
    });

    it('should throw error when claim does not exist', async () => {
      const claimId = 'non-existent-claim';
      const finderId = 'finder-user-id';

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(claimService.approveClaim(claimId, finderId)).rejects.toThrow(
        'Claim not found'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
      expect(messagingService.ensureThread).not.toHaveBeenCalled();
    });

    it('should throw error when non-finder tries to approve', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';
      const unauthorizedUserId = 'unauthorized-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        claimService.approveClaim(claimId, unauthorizedUserId)
      ).rejects.toThrow('Only the finder can approve this claim');

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });

    it('should throw error when claim is not OPEN', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.ACCEPTED, // Already accepted
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.approveClaim(claimId, finderId)).rejects.toThrow(
        'Claim is not open'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });
  });

  describe('CST-3: denyClaim', () => {
    it('should successfully deny a claim by the finder', async () => {
      const claimId = 'pending-claim-id';
      const finderId = 'finder-user-id';
      const claimerId = 'claimer-user-id';
      const itemId = 'item-id';

      const mockClaim = {
        claimId,
        itemId,
        claimerId,
        finderId,
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      const mockUpdatedClaim = {
        ...mockClaim,
        status: ClaimStatus.DECLINED,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.claim.update as jest.Mock).mockResolvedValue(mockUpdatedClaim);
      (messagingService.archiveConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await claimService.denyClaim(claimId, finderId);

      expect(result.status).toBe(ClaimStatus.DECLINED);
      expect(prisma.claim.findUnique).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.claim.update).toHaveBeenCalledWith({
        where: { claimId },
        data: { status: ClaimStatus.DECLINED },
      });
      expect(messagingService.archiveConversation).toHaveBeenCalledWith(claimId);
    });

    it('should throw error when claim does not exist', async () => {
      const claimId = 'non-existent-claim';
      const finderId = 'finder-user-id';

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(claimService.denyClaim(claimId, finderId)).rejects.toThrow(
        'Claim not found'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
      expect(messagingService.archiveConversation).not.toHaveBeenCalled();
    });

    it('should throw error when non-finder tries to deny', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';
      const unauthorizedUserId = 'unauthorized-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.denyClaim(claimId, unauthorizedUserId)).rejects.toThrow(
        'Only the finder can deny this claim'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });

    it('should throw error when claim is not OPEN', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.DECLINED, // Already declined
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.denyClaim(claimId, finderId)).rejects.toThrow(
        'Claim is not open'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });
  });

  describe('CST-4: getClaimsByUser', () => {
    it('should return all claims created by a specific user', async () => {
      const userId = 'user-123';

      const mockClaims = [
        {
          claimId: 'claim-1',
          itemId: 'item-1',
          claimerId: userId,
          finderId: 'finder-1',
          status: ClaimStatus.OPEN,
          handedOff: false,
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          claimId: 'claim-2',
          itemId: 'item-2',
          claimerId: userId,
          finderId: 'finder-2',
          status: ClaimStatus.ACCEPTED,
          handedOff: false,
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
        {
          claimId: 'claim-3',
          itemId: 'item-3',
          claimerId: userId,
          finderId: 'finder-3',
          status: ClaimStatus.DECLINED,
          handedOff: false,
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
      ];

      (prisma.claim.findMany as jest.Mock).mockResolvedValue(mockClaims);

      const result = await claimService.getClaimsByUser(userId);

      expect(result).toHaveLength(3);
      expect(result.every(claim => claim.claimerId === userId)).toBe(true);
      expect(prisma.claim.findMany).toHaveBeenCalledWith({
        where: { claimerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return claims sorted by createdAt descending', async () => {
      const userId = 'user-123';

      const mockClaims = [
        {
          claimId: 'claim-3',
          itemId: 'item-3',
          claimerId: userId,
          finderId: 'finder-3',
          status: ClaimStatus.OPEN,
          handedOff: false,
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          claimId: 'claim-1',
          itemId: 'item-1',
          claimerId: userId,
          finderId: 'finder-1',
          status: ClaimStatus.ACCEPTED,
          handedOff: false,
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (prisma.claim.findMany as jest.Mock).mockResolvedValue(mockClaims);

      const result = await claimService.getClaimsByUser(userId);

      expect(result[0].claimId).toBe('claim-3');
      expect(result[1].claimId).toBe('claim-1');
      expect(prisma.claim.findMany).toHaveBeenCalledWith({
        where: { claimerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no claims', async () => {
      const userId = 'user-with-no-claims';

      (prisma.claim.findMany as jest.Mock).mockResolvedValue([]);

      const result = await claimService.getClaimsByUser(userId);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
      expect(prisma.claim.findMany).toHaveBeenCalledWith({
        where: { claimerId: userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('markHandedOff', () => {
    it('should successfully mark item as handed off by finder', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';
      const claimerId = 'claimer-user-id';
      const itemId = 'item-id';

      const mockClaim = {
        claimId,
        itemId,
        claimerId,
        finderId,
        status: ClaimStatus.ACCEPTED,
        handedOff: false,
        createdAt: new Date(),
      };

      const mockUpdatedClaim = {
        ...mockClaim,
        handedOff: true,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.claim.update as jest.Mock).mockResolvedValue(mockUpdatedClaim);

      const result = await claimService.markHandedOff(claimId, finderId);

      expect(result.handedOff).toBe(true);
      expect(prisma.claim.findUnique).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.claim.update).toHaveBeenCalledWith({
        where: { claimId },
        data: { handedOff: true },
      });
    });

    it('should throw error when claim does not exist', async () => {
      const claimId = 'non-existent-claim';
      const finderId = 'finder-user-id';

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(claimService.markHandedOff(claimId, finderId)).rejects.toThrow(
        'Claim not found'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });

    it('should throw error when non-finder tries to mark as handed off', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';
      const unauthorizedUserId = 'unauthorized-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.ACCEPTED,
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        claimService.markHandedOff(claimId, unauthorizedUserId)
      ).rejects.toThrow('Only the finder can mark item as handed off');

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });

    it('should throw error when claim is not ACCEPTED', async () => {
      const claimId = 'claim-id';
      const finderId = 'finder-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId: 'claimer-id',
        finderId,
        status: ClaimStatus.OPEN, // Not ACCEPTED
        handedOff: false,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.markHandedOff(claimId, finderId)).rejects.toThrow(
        'Claim must be accepted before marking as handed off'
      );

      expect(prisma.claim.update).not.toHaveBeenCalled();
    });
  });

  describe('confirmReceipt', () => {
    it('should successfully confirm receipt and update item status to CLAIMED', async () => {
      const claimId = 'claim-id';
      const claimerId = 'claimer-user-id';
      const finderId = 'finder-user-id';
      const itemId = 'item-id';

      const mockClaim = {
        claimId,
        itemId,
        claimerId,
        finderId,
        status: ClaimStatus.ACCEPTED,
        handedOff: true,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (itemService.updateItemStatus as jest.Mock).mockResolvedValue({
        itemId,
        status: ItemStatus.CLAIMED,
      });
      (messagingService.hideConversation as jest.Mock).mockResolvedValue(undefined);

      const result = await claimService.confirmReceipt(claimId, claimerId);

      expect(result).toEqual(mockClaim);
      expect(itemService.updateItemStatus).toHaveBeenCalledWith(itemId, ItemStatus.CLAIMED);
      expect(messagingService.hideConversation).toHaveBeenCalledWith(claimId);
    });

    it('should throw error when claim does not exist', async () => {
      const claimId = 'non-existent-claim';
      const claimerId = 'claimer-user-id';

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(claimService.confirmReceipt(claimId, claimerId)).rejects.toThrow(
        'Claim not found'
      );

      expect(itemService.updateItemStatus).not.toHaveBeenCalled();
      expect(messagingService.hideConversation).not.toHaveBeenCalled();
    });

    it('should throw error when non-claimer tries to confirm receipt', async () => {
      const claimId = 'claim-id';
      const claimerId = 'claimer-user-id';
      const unauthorizedUserId = 'unauthorized-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId,
        finderId: 'finder-id',
        status: ClaimStatus.ACCEPTED,
        handedOff: true,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        claimService.confirmReceipt(claimId, unauthorizedUserId)
      ).rejects.toThrow('Only the claimer can confirm receipt');

      expect(itemService.updateItemStatus).not.toHaveBeenCalled();
      expect(messagingService.hideConversation).not.toHaveBeenCalled();
    });

    it('should throw error when claim is not ACCEPTED', async () => {
      const claimId = 'claim-id';
      const claimerId = 'claimer-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId,
        finderId: 'finder-id',
        status: ClaimStatus.OPEN, // Not ACCEPTED
        handedOff: true,
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.confirmReceipt(claimId, claimerId)).rejects.toThrow(
        'Claim must be accepted before confirming receipt'
      );

      expect(itemService.updateItemStatus).not.toHaveBeenCalled();
      expect(messagingService.hideConversation).not.toHaveBeenCalled();
    });

    it('should throw error when item has not been handed off', async () => {
      const claimId = 'claim-id';
      const claimerId = 'claimer-user-id';

      const mockClaim = {
        claimId,
        itemId: 'item-id',
        claimerId,
        finderId: 'finder-id',
        status: ClaimStatus.ACCEPTED,
        handedOff: false, // Not handed off yet
        createdAt: new Date(),
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(claimService.confirmReceipt(claimId, claimerId)).rejects.toThrow(
        'Item must be handed off before confirming receipt'
      );

      expect(itemService.updateItemStatus).not.toHaveBeenCalled();
      expect(messagingService.hideConversation).not.toHaveBeenCalled();
    });
  });
});

