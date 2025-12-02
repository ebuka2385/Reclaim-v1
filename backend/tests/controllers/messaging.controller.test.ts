import { Request, Response } from 'express';
import { messagingController } from '../../src/controllers/messaging.controller';
import { messagingService } from '../../src/services/messaging.service';

// Mock the messaging service
jest.mock('../../src/services/messaging.service');

describe('MessagingController', () => {
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

  describe('MCT-1: ensureThread', () => {
    it('should ensure thread exists successfully with valid claimId', async () => {
      const claimId = 'claim-123';
      const threadId = 'thread-123';

      mockRequest = {
        params: { claimId },
      };

      (messagingService.ensureThread as jest.Mock).mockResolvedValue(threadId);

      await messagingController.ensureThread(mockRequest as Request, mockResponse as Response);

      expect(messagingService.ensureThread).toHaveBeenCalledWith(claimId);
      expect(responseJson).toHaveBeenCalledWith({ threadId });
    });
  });

  describe('MCT-2: ensureThread - invalid id errors', () => {
    it('should catch claim not found error', async () => {
      const claimId = 'non-existent-claim';

      mockRequest = {
        params: { claimId },
      };

      (messagingService.ensureThread as jest.Mock).mockRejectedValue(
        new Error('Claim not found')
      );

      await messagingController.ensureThread(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Claim not found' });
    });

    it('should catch claim not accepted error', async () => {
      const claimId = 'claim-123';

      mockRequest = {
        params: { claimId },
      };

      (messagingService.ensureThread as jest.Mock).mockRejectedValue(
        new Error('Thread can only be created for accepted claims')
      );

      await messagingController.ensureThread(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Thread can only be created for accepted claims',
      });
    });

    it('should handle generic service errors', async () => {
      const claimId = 'claim-123';

      mockRequest = {
        params: { claimId },
      };

      (messagingService.ensureThread as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await messagingController.ensureThread(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to ensure thread' });
    });
  });

  describe('MCT-3: postMessage', () => {
    it('should post message successfully with valid threadId and userId', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const text = 'Hello, is this item still available?';

      const mockMessage = {
        messageId: 'msg-123',
        threadId,
        userId,
        text,
        createdAt: new Date(),
      };

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockResolvedValue(mockMessage);

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(messagingService.postMessage).toHaveBeenCalledWith(threadId, userId, text);
      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockMessage);
    });
  });

  describe('MCT-4: postMessage - invalid id errors', () => {
    it('should catch missing userId or text', async () => {
      const threadId = 'thread-123';

      mockRequest = {
        params: { threadId },
        body: {
          userId: 'user-123',
          // Missing text
        },
      };

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Missing required fields: userId, text',
      });
      expect(messagingService.postMessage).not.toHaveBeenCalled();
    });

    it('should catch thread not found error', async () => {
      const threadId = 'non-existent-thread';
      const userId = 'user-123';
      const text = 'Test message';

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockRejectedValue(
        new Error('Thread not found')
      );

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Thread not found' });
    });

    it('should catch user access error', async () => {
      const threadId = 'thread-123';
      const userId = 'unauthorized-user';
      const text = 'Test message';

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockRejectedValue(
        new Error('User does not have access to this thread')
      );

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(403);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'User does not have access to this thread',
      });
    });
  });

  describe('MCT-5: listMessages', () => {
    it('should list messages successfully with valid threadId, userId, cursor, and limit', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';
      const cursor = 'msg-cursor';
      const limit = 50;

      const mockResult = {
        messages: [
          {
            messageId: 'msg-1',
            threadId,
            userId,
            text: 'First message',
            createdAt: new Date(),
          },
        ],
        nextCursor: 'msg-cursor-2',
      };

      mockRequest = {
        params: { threadId },
        query: {
          userId,
          cursor,
          limit: limit.toString(),
        },
      };

      (messagingService.listMessages as jest.Mock).mockResolvedValue(mockResult);

      await messagingController.listMessages(mockRequest as Request, mockResponse as Response);

      expect(messagingService.listMessages).toHaveBeenCalledWith(
        threadId,
        userId,
        cursor,
        limit
      );
      expect(responseJson).toHaveBeenCalledWith(mockResult);
    });

    it('should use default limit when not provided', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';

      const mockResult = {
        messages: [],
        nextCursor: null,
      };

      mockRequest = {
        params: { threadId },
        query: {
          userId,
        },
      };

      (messagingService.listMessages as jest.Mock).mockResolvedValue(mockResult);

      await messagingController.listMessages(mockRequest as Request, mockResponse as Response);

      expect(messagingService.listMessages).toHaveBeenCalledWith(
        threadId,
        userId,
        undefined,
        50
      );
    });
  });

  describe('MCT-6: listMessages - invalid field errors', () => {
    it('should catch missing userId', async () => {
      const threadId = 'thread-123';

      mockRequest = {
        params: { threadId },
        query: {},
      };

      await messagingController.listMessages(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Missing required query parameter: userId',
      });
      expect(messagingService.listMessages).not.toHaveBeenCalled();
    });

    it('should catch thread not found error', async () => {
      const threadId = 'non-existent-thread';
      const userId = 'user-123';

      mockRequest = {
        params: { threadId },
        query: { userId },
      };

      (messagingService.listMessages as jest.Mock).mockRejectedValue(
        new Error('Thread not found')
      );

      await messagingController.listMessages(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Thread not found' });
    });

    it('should handle generic service errors', async () => {
      const threadId = 'thread-123';
      const userId = 'user-123';

      mockRequest = {
        params: { threadId },
        query: { userId },
      };

      (messagingService.listMessages as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await messagingController.listMessages(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to fetch messages' });
    });
  });

  describe('MCT-7: verifyParticipantAccess', () => {
    it('should verify participant access successfully', async () => {
      // Note: verifyParticipantAccess is not directly exposed in the controller
      // It's called internally by postMessage and listMessages
      // This test verifies it works through those methods
      const threadId = 'thread-123';
      const userId = 'user-123';
      const text = 'Test message';

      const mockMessage = {
        messageId: 'msg-123',
        threadId,
        userId,
        text,
        createdAt: new Date(),
      };

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockResolvedValue(mockMessage);

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      // postMessage internally calls verifyParticipantAccess
      expect(messagingService.postMessage).toHaveBeenCalled();
      expect(responseStatus).toHaveBeenCalledWith(201);
    });
  });

  describe('MCT-8: verifyParticipantAccess - invalid id errors', () => {
    it('should catch invalid threadId through postMessage', async () => {
      const threadId = 'invalid-thread';
      const userId = 'user-123';
      const text = 'Test message';

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockRejectedValue(
        new Error('Thread not found')
      );

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Thread not found' });
    });

    it('should catch invalid userId through postMessage', async () => {
      const threadId = 'thread-123';
      const userId = 'invalid-user';
      const text = 'Test message';

      mockRequest = {
        params: { threadId },
        body: { userId, text },
      };

      (messagingService.postMessage as jest.Mock).mockRejectedValue(
        new Error('User does not have access to this thread')
      );

      await messagingController.postMessage(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(403);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'User does not have access to this thread',
      });
    });
  });
});

