import { Request, Response } from 'express';
import { claimController } from '../../src/controllers/claim.controller';
import { claimService } from '../../src/services/claim.service';
import { ClaimStatus } from '../../src/types/claim.types';

// Mock the claim service
jest.mock('../../src/services/claim.service');

describe('ClaimController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;
  let responseStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    responseJson = jest.fn().mockReturnThis();
    responseStatus = jest.fn().mockReturnThis();

    mockResponse = {
      json: responseJson,
      status: responseStatus,
    };

    mockRequest = {};
  });

  describe('CCT-1: createClaim', () => {
    it('should create claim successfully with valid itemId and ownerId', async () => {
      const mockClaim = {
        claimId: 'claim-123',
        itemId: 'item-123',
        claimerId: 'owner-123',
        finderId: 'finder-123',
        status: ClaimStatus.OPEN,
        handedOff: false,
        createdAt: new Date(),
      };

      mockRequest = {
        body: {
          itemId: 'item-123',
          ownerId: 'owner-123',
        },
      };

      (claimService.createClaim as jest.Mock).mockResolvedValue(mockClaim);

      await claimController.createClaim(mockRequest as Request, mockResponse as Response);

      expect(claimService.createClaim).toHaveBeenCalledWith('item-123', 'owner-123');
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockClaim);
    });
  });

  describe('CCT-2: createClaim - invalid id errors', () => {
    it('should catch missing itemId or ownerId', async () => {
      mockRequest = {
        body: {
          itemId: 'item-123',
          // Missing ownerId
        },
      };

      await claimController.createClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Missing required fields: itemId, ownerId',
      });
      expect(claimService.createClaim).not.toHaveBeenCalled();
    });

    it('should catch item not found error', async () => {
      mockRequest = {
        body: {
          itemId: 'non-existent-item',
          ownerId: 'owner-123',
        },
      };

      (claimService.createClaim as jest.Mock).mockRejectedValue(
        new Error('Item not found')
      );

      await claimController.createClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Item not found' });
    });

    it('should catch cannot claim own item error', async () => {
      mockRequest = {
        body: {
          itemId: 'item-123',
          ownerId: 'same-user-id',
        },
      };

      (claimService.createClaim as jest.Mock).mockRejectedValue(
        new Error('Cannot claim your own item')
      );

      await claimController.createClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Cannot claim your own item' });
    });

    it('should catch generic service errors', async () => {
      mockRequest = {
        body: {
          itemId: 'item-123',
          ownerId: 'owner-123',
        },
      };

      (claimService.createClaim as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await claimController.createClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to create claim' });
    });
  });

  describe('CCT-3: approveClaim', () => {
    it('should approve claim successfully with valid claimId and finderId', async () => {
      const mockClaim = {
        claimId: 'claim-123',
        itemId: 'item-123',
        claimerId: 'claimer-123',
        finderId: 'finder-123',
        status: ClaimStatus.ACCEPTED,
        handedOff: false,
        createdAt: new Date(),
      };

      mockRequest = {
        params: { id: 'claim-123' },
        body: { finderId: 'finder-123' },
      };

      (claimService.approveClaim as jest.Mock).mockResolvedValue(mockClaim);

      await claimController.approveClaim(mockRequest as Request, mockResponse as Response);

      expect(claimService.approveClaim).toHaveBeenCalledWith('claim-123', 'finder-123');
      expect(responseJson).toHaveBeenCalledWith(mockClaim);
    });
  });

  describe('CCT-4: approveClaim - invalid id errors', () => {
    it('should catch missing finderId', async () => {
      mockRequest = {
        params: { id: 'claim-123' },
        body: {},
      };

      await claimController.approveClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Missing required field: finderId',
      });
      expect(claimService.approveClaim).not.toHaveBeenCalled();
    });

    it('should catch claim not found error', async () => {
      mockRequest = {
        params: { id: 'non-existent-claim' },
        body: { finderId: 'finder-123' },
      };

      (claimService.approveClaim as jest.Mock).mockRejectedValue(
        new Error('Claim not found')
      );

      await claimController.approveClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Claim not found' });
    });

    it('should catch only finder can approve error', async () => {
      mockRequest = {
        params: { id: 'claim-123' },
        body: { finderId: 'wrong-user-id' },
      };

      (claimService.approveClaim as jest.Mock).mockRejectedValue(
        new Error('Only the finder can approve this claim')
      );

      await claimController.approveClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Only the finder can approve this claim',
      });
    });

    it('should catch claim not open error', async () => {
      mockRequest = {
        params: { id: 'claim-123' },
        body: { finderId: 'finder-123' },
      };

      (claimService.approveClaim as jest.Mock).mockRejectedValue(
        new Error('Claim is not open')
      );

      await claimController.approveClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Claim is not open' });
    });
  });

  describe('CCT-5: denyClaim', () => {
    it('should deny claim successfully with valid claimId and finderId', async () => {
      const mockClaim = {
        claimId: 'claim-123',
        itemId: 'item-123',
        claimerId: 'claimer-123',
        finderId: 'finder-123',
        status: ClaimStatus.DECLINED,
        handedOff: false,
        createdAt: new Date(),
      };

      mockRequest = {
        params: { id: 'claim-123' },
        body: { finderId: 'finder-123' },
      };

      (claimService.denyClaim as jest.Mock).mockResolvedValue(mockClaim);

      await claimController.denyClaim(mockRequest as Request, mockResponse as Response);

      expect(claimService.denyClaim).toHaveBeenCalledWith('claim-123', 'finder-123');
      expect(responseJson).toHaveBeenCalledWith(mockClaim);
    });
  });

  describe('CCT-6: denyClaim - invalid id errors', () => {
    it('should catch missing finderId', async () => {
      mockRequest = {
        params: { id: 'claim-123' },
        body: {},
      };

      await claimController.denyClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Missing required field: finderId',
      });
      expect(claimService.denyClaim).not.toHaveBeenCalled();
    });

    it('should catch claim not found error', async () => {
      mockRequest = {
        params: { id: 'non-existent-claim' },
        body: { finderId: 'finder-123' },
      };

      (claimService.denyClaim as jest.Mock).mockRejectedValue(
        new Error('Claim not found')
      );

      await claimController.denyClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Claim not found' });
    });

    it('should catch only finder can deny error', async () => {
      mockRequest = {
        params: { id: 'claim-123' },
        body: { finderId: 'wrong-user-id' },
      };

      (claimService.denyClaim as jest.Mock).mockRejectedValue(
        new Error('Only the finder can deny this claim')
      );

      await claimController.denyClaim(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Only the finder can deny this claim',
      });
    });
  });

  describe('CCT-7: getClaimsByUser', () => {
    it('should return claims for user successfully', async () => {
      const userId = 'user-123';
      const mockClaims = [
        {
          claimId: 'claim-1',
          itemId: 'item-1',
          claimerId: userId,
          finderId: 'finder-1',
          status: ClaimStatus.OPEN,
          handedOff: false,
          createdAt: new Date(),
        },
        {
          claimId: 'claim-2',
          itemId: 'item-2',
          claimerId: userId,
          finderId: 'finder-2',
          status: ClaimStatus.ACCEPTED,
          handedOff: false,
          createdAt: new Date(),
        },
      ];

      mockRequest = {
        params: { userId },
      };

      (claimService.getClaimsByUser as jest.Mock).mockResolvedValue(mockClaims);

      await claimController.getClaimsByUser(mockRequest as Request, mockResponse as Response);

      expect(claimService.getClaimsByUser).toHaveBeenCalledWith(userId);
      expect(responseJson).toHaveBeenCalledWith({ claims: mockClaims });
    });
  });

  describe('CCT-8: getClaimsByUser - invalid user id', () => {
    it('should handle service errors', async () => {
      const userId = 'invalid-user-id';

      mockRequest = {
        params: { userId },
      };

      (claimService.getClaimsByUser as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await claimController.getClaimsByUser(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to fetch claims' });
    });
  });
});

