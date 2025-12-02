import { ClaimStatus } from '../../src/types/claim.types';
import { prisma } from '../../__mocks__/prismaclient';

// Mock Prisma Client before importing the service
jest.mock('@prisma/client', () => {
  const mockPrisma = require('../../__mocks__/prismaclient').prisma;
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Import service after mocking Prisma
import { messagingService } from '../../src/services/messaging.service';

describe('MessagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MST-1: ensureThread', () => {
    it('should create a new thread when claim exists but thread does not', async () => {
      const claimId = 'test-claim-id';
      const claimerId = 'claimer-user-id';
      const finderId = 'finder-user-id';
      const threadId = 'new-thread-id';

      // Mock claim exists and is ACCEPTED
      const mockClaim = {
        claimId,
        claimerId,
        finderId,
        status: ClaimStatus.ACCEPTED,
      };

      // Mock no existing thread
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(null);

      // Mock thread creation
      const mockThread = {
        threadId,
        claimId,
        claimerId,
        finderId,
        archived: false,
        hidden: false,
        createdAt: new Date(),
      };
      (prisma.thread.create as jest.Mock).mockResolvedValue(mockThread);

      const result = await messagingService.ensureThread(claimId);

      expect(result).toBe(threadId);
      expect(prisma.claim.findUnique).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.create).toHaveBeenCalledWith({
        data: {
          claimId,
          claimerId,
          finderId,
          archived: false,
          hidden: false,
        },
      });
    });

    it('should return existing thread if one already exists', async () => {
      const claimId = 'test-claim-id';
      const existingThreadId = 'existing-thread-id';

      const mockClaim = {
        claimId,
        claimerId: 'claimer-id',
        finderId: 'finder-id',
        status: ClaimStatus.ACCEPTED,
      };

      const mockExistingThread = {
        threadId: existingThreadId,
        claimId,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);
      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(mockExistingThread);

      const result = await messagingService.ensureThread(claimId);

      expect(result).toBe(existingThreadId);
      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.create).not.toHaveBeenCalled();
    });

    it('should throw error if claim does not exist', async () => {
      const claimId = 'non-existent-claim';

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(messagingService.ensureThread(claimId)).rejects.toThrow(
        'Claim not found'
      );
    });

    it('should throw error if claim is not ACCEPTED', async () => {
      const claimId = 'test-claim-id';

      const mockClaim = {
        claimId,
        status: ClaimStatus.OPEN,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(messagingService.ensureThread(claimId)).rejects.toThrow(
        'Thread can only be created for accepted claims'
      );
    });

    it('should throw error if claim status is DECLINED', async () => {
      const claimId = 'test-claim-id';

      const mockClaim = {
        claimId,
        status: ClaimStatus.DECLINED,
      };

      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(messagingService.ensureThread(claimId)).rejects.toThrow(
        'Thread can only be created for accepted claims'
      );
    });
  });

  describe('MST-2: postMessage', () => {
    it('should successfully post a message to an existing thread', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';
      const text = 'Hello, is this item still available?';
      const messageId = 'new-message-id';

      // Mock verifyParticipantAccess (by mocking thread and claim lookups)
      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Mock message creation
      const mockMessage = {
        messageId,
        threadId,
        userId,
        text,
        createdAt: new Date(),
      };
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await messagingService.postMessage(threadId, userId, text);

      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          threadId,
          userId,
          text,
        },
      });
    });

    it('should successfully post a message as finder user', async () => {
      const threadId = 'test-thread-id';
      const finderId = 'finder-user-id';
      const text = 'Yes, it is still available!';
      const messageId = 'new-message-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: 'claimer-id',
        finderId,
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      const mockMessage = {
        messageId,
        threadId,
        userId: finderId,
        text,
        createdAt: new Date(),
      };
      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await messagingService.postMessage(threadId, finderId, text);

      expect(result).toEqual(mockMessage);
      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          threadId,
          userId: finderId,
          text,
        },
      });
    });

    it('should throw error if user does not have access to thread', async () => {
      const threadId = 'test-thread-id';
      const userId = 'unauthorized-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: 'claimer-id',
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        messagingService.postMessage(threadId, userId, 'test message')
      ).rejects.toThrow('User does not have access to this thread');
    });
  });

  describe('MST-3: listMessages', () => {
    it('should return messages in order from first to last', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      // Mock verifyParticipantAccess
      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Mock messages (ordered by createdAt desc, then reversed to oldest first)
      const mockMessages = [
        {
          messageId: 'msg-3',
          threadId,
          userId: 'finder-id',
          text: 'Third message',
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          messageId: 'msg-2',
          threadId,
          userId: userId,
          text: 'Second message',
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          messageId: 'msg-1',
          threadId,
          userId: 'finder-id',
          text: 'First message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messagingService.listMessages(threadId, userId);

      expect(result.messages).toHaveLength(3);
      // Messages should be returned oldest first (after reverse)
      expect(result.messages[0].messageId).toBe('msg-1');
      expect(result.messages[0].text).toBe('First message');
      expect(result.messages[1].messageId).toBe('msg-2');
      expect(result.messages[1].text).toBe('Second message');
      expect(result.messages[2].messageId).toBe('msg-3');
      expect(result.messages[2].text).toBe('Third message');
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { threadId },
        orderBy: { createdAt: 'desc' },
        take: 51, // limit + 1
      });
    });

    it('should handle pagination with cursor', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';
      const cursor = 'msg-3';

      // Mock verifyParticipantAccess
      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      const mockMessages = [
        {
          messageId: 'msg-2',
          threadId,
          text: 'Second message',
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          messageId: 'msg-1',
          threadId,
          text: 'First message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messagingService.listMessages(threadId, userId, cursor);

      expect(result.messages).toHaveLength(2);
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: {
          threadId,
          messageId: { lt: cursor },
        },
        orderBy: { createdAt: 'desc' },
        take: 51,
      });
    });

    it('should return nextCursor when there are more messages than limit', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';
      const limit = 2;

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Return 3 messages when limit is 2 (limit + 1 = 3)
      const mockMessages = [
        {
          messageId: 'msg-3',
          threadId,
          text: 'Third message',
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          messageId: 'msg-2',
          threadId,
          text: 'Second message',
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          messageId: 'msg-1',
          threadId,
          text: 'First message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messagingService.listMessages(threadId, userId, null, limit);

      expect(result.messages).toHaveLength(2); // Should return only limit messages
      // After slice(0, 2) we have [msg-3, msg-2], then reverse to [msg-2, msg-3]
      // nextCursor is the last message ID BEFORE reverse, which is msg-2
      expect(result.nextCursor).toBe('msg-2'); // Last message ID in returned set (before reverse)
      // After reverse, messages are [msg-2, msg-3] (newest to oldest, but we only have 2)
      expect(result.messages[0].messageId).toBe('msg-2');
      expect(result.messages[1].messageId).toBe('msg-3');
    });

    it('should return null nextCursor when there are no more messages', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';
      const limit = 50;

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Return only 2 messages (less than limit)
      const mockMessages = [
        {
          messageId: 'msg-2',
          threadId,
          text: 'Second message',
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          messageId: 'msg-1',
          threadId,
          text: 'First message',
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messagingService.listMessages(threadId, userId, null, limit);

      expect(result.messages).toHaveLength(2);
      expect(result.nextCursor).toBeNull(); // No more messages
    });

    it('should return null nextCursor when no messages exist', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      (prisma.message.findMany as jest.Mock).mockResolvedValue([]);

      const result = await messagingService.listMessages(threadId, userId);

      expect(result.messages).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });
  });

  describe('MST-4: verifyParticipantAccess', () => {
    it('should allow access for claimer user', async () => {
      const threadId = 'test-thread-id';
      const claimerId = 'claimer-user-id';
      const finderId = 'finder-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId,
        finderId,
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Should not throw
      await expect(
        messagingService.verifyParticipantAccess(threadId, claimerId)
      ).resolves.not.toThrow();
    });

    it('should allow access for finder user', async () => {
      const threadId = 'test-thread-id';
      const claimerId = 'claimer-user-id';
      const finderId = 'finder-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId,
        finderId,
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      // Should not throw
      await expect(
        messagingService.verifyParticipantAccess(threadId, finderId)
      ).resolves.not.toThrow();
    });

    it('should deny access for unauthorized user', async () => {
      const threadId = 'test-thread-id';
      const unauthorizedUserId = 'unauthorized-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: 'claimer-id',
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.ACCEPTED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        messagingService.verifyParticipantAccess(threadId, unauthorizedUserId)
      ).rejects.toThrow('User does not have access to this thread');
    });

    it('should deny access if thread is archived', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: true, // Archived
        hidden: false,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: {},
      });

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Thread is archived and cannot be accessed');
    });

    it('should deny access if thread is hidden', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: true, // Hidden
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: {},
      });

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Thread is hidden and cannot be accessed');
    });

    it('should deny access if claim is DECLINED', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.DECLINED,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Thread is not accessible - claim was declined');
    });

    it('should throw error if thread does not exist', async () => {
      const threadId = 'non-existent-thread';
      const userId = 'claimer-user-id';

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Thread not found');
    });

    it('should throw error if claim does not exist', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'non-existent-claim',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: null,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Claim not found');
    });

    it('should deny access if claim status is OPEN (not ACCEPTED)', async () => {
      const threadId = 'test-thread-id';
      const userId = 'claimer-user-id';

      const mockThread = {
        threadId,
        claimId: 'claim-id',
        claimerId: userId,
        finderId: 'finder-id',
        archived: false,
        hidden: false,
      };

      const mockClaim = {
        claimId: 'claim-id',
        status: ClaimStatus.OPEN,
      };

      (prisma.thread.findUnique as jest.Mock).mockResolvedValue({
        ...mockThread,
        claim: mockClaim,
      });
      (prisma.claim.findUnique as jest.Mock).mockResolvedValue(mockClaim);

      await expect(
        messagingService.verifyParticipantAccess(threadId, userId)
      ).rejects.toThrow('Thread is not accessible - claim is not accepted');
    });
  });

  describe('MST-5: archiveConversation', () => {
    it('should archive a conversation when thread exists', async () => {
      const claimId = 'test-claim-id';
      const threadId = 'test-thread-id';

      const mockThread = {
        threadId,
        claimId,
        archived: false,
        hidden: false,
      };

      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(mockThread);
      (prisma.thread.update as jest.Mock).mockResolvedValue({
        ...mockThread,
        archived: true,
      });

      await messagingService.archiveConversation(claimId);

      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.update).toHaveBeenCalledWith({
        where: { threadId },
        data: { archived: true },
      });
    });

    it('should return silently if thread does not exist', async () => {
      const claimId = 'test-claim-id';

      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(null);

      await messagingService.archiveConversation(claimId);

      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.update).not.toHaveBeenCalled();
    });
  });

  describe('MST-6: hideConversation', () => {
    it('should hide a conversation when thread exists', async () => {
      const claimId = 'test-claim-id';
      const threadId = 'test-thread-id';

      const mockThread = {
        threadId,
        claimId,
        archived: false,
        hidden: false,
      };

      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(mockThread);
      (prisma.thread.update as jest.Mock).mockResolvedValue({
        ...mockThread,
        hidden: true,
      });

      await messagingService.hideConversation(claimId);

      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.update).toHaveBeenCalledWith({
        where: { threadId },
        data: { hidden: true },
      });
    });

    it('should throw error if thread does not exist', async () => {
      const claimId = 'test-claim-id';

      (prisma.thread.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(messagingService.hideConversation(claimId)).rejects.toThrow(
        'Thread not found for this claim'
      );

      expect(prisma.thread.findFirst).toHaveBeenCalledWith({
        where: { claimId },
      });
      expect(prisma.thread.update).not.toHaveBeenCalled();
    });
  });

  describe('MST-7: getConversationsByUser', () => {
    it('should return conversations for claimer user', async () => {
      const userId = 'claimer-user-id';
      const threadId1 = 'thread-1';
      const threadId2 = 'thread-2';

      const mockThreads = [
        {
          threadId: threadId1,
          claimId: 'claim-1',
          claimerId: userId,
          finderId: 'finder-1',
          archived: false,
          hidden: false,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          claim: {
            claimId: 'claim-1',
            item: {
              itemId: 'item-1',
              title: 'Lost Phone',
            },
          },
        },
        {
          threadId: threadId2,
          claimId: 'claim-2',
          claimerId: userId,
          finderId: 'finder-2',
          archived: false,
          hidden: false,
          createdAt: new Date('2024-01-01T10:00:00Z'),
          claim: {
            claimId: 'claim-2',
            item: {
              itemId: 'item-2',
              title: 'Lost Wallet',
            },
          },
        },
      ];

      (prisma.thread.findMany as jest.Mock).mockResolvedValue(mockThreads);

      // Mock last message for each thread
      const mockLastMessage1 = {
        messageId: 'msg-1',
        threadId: threadId1,
        text: 'Last message in thread 1',
        createdAt: new Date('2024-01-02T11:00:00Z'),
      };
      const mockLastMessage2 = {
        messageId: 'msg-2',
        threadId: threadId2,
        text: 'Last message in thread 2',
        createdAt: new Date('2024-01-01T11:00:00Z'),
      };

      (prisma.message.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockLastMessage1)
        .mockResolvedValueOnce(mockLastMessage2);

      const result = await messagingService.getConversationsByUser(userId);

      expect(result).toHaveLength(2);
      expect(result[0].threadId).toBe(threadId1);
      expect(result[0].lastMessage).toEqual(mockLastMessage1);
      expect(result[1].threadId).toBe(threadId2);
      expect(result[1].lastMessage).toEqual(mockLastMessage2);

      expect(prisma.thread.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { claimerId: userId },
            { finderId: userId },
          ],
          archived: false,
          hidden: false,
        },
        include: {
          claim: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return conversations for finder user', async () => {
      const userId = 'finder-user-id';
      const threadId = 'thread-1';

      const mockThreads = [
        {
          threadId,
          claimId: 'claim-1',
          claimerId: 'claimer-1',
          finderId: userId,
          archived: false,
          hidden: false,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          claim: {
            claimId: 'claim-1',
            item: {
              itemId: 'item-1',
              title: 'Found Phone',
            },
          },
        },
      ];

      (prisma.thread.findMany as jest.Mock).mockResolvedValue(mockThreads);
      (prisma.message.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await messagingService.getConversationsByUser(userId);

      expect(result).toHaveLength(1);
      expect(result[0].threadId).toBe(threadId);
      expect(result[0].lastMessage).toBeNull();
    });

    it('should filter out archived conversations', async () => {
      const userId = 'user-id';

      (prisma.thread.findMany as jest.Mock).mockResolvedValue([]);

      await messagingService.getConversationsByUser(userId);

      expect(prisma.thread.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { claimerId: userId },
            { finderId: userId },
          ],
          archived: false,
          hidden: false,
        },
        include: {
          claim: {
            include: {
              item: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter out hidden conversations', async () => {
      const userId = 'user-id';

      (prisma.thread.findMany as jest.Mock).mockResolvedValue([]);

      await messagingService.getConversationsByUser(userId);

      expect(prisma.thread.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            hidden: false,
          }),
        })
      );
    });

    it('should return empty array when user has no conversations', async () => {
      const userId = 'user-with-no-conversations';

      (prisma.thread.findMany as jest.Mock).mockResolvedValue([]);

      const result = await messagingService.getConversationsByUser(userId);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it('should return conversations with null lastMessage when thread has no messages', async () => {
      const userId = 'user-id';
      const threadId = 'thread-1';

      const mockThreads = [
        {
          threadId,
          claimId: 'claim-1',
          claimerId: userId,
          finderId: 'finder-1',
          archived: false,
          hidden: false,
          createdAt: new Date('2024-01-02T10:00:00Z'),
          claim: {
            claimId: 'claim-1',
            item: {
              itemId: 'item-1',
              title: 'Lost Phone',
            },
          },
        },
      ];

      (prisma.thread.findMany as jest.Mock).mockResolvedValue(mockThreads);
      (prisma.message.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await messagingService.getConversationsByUser(userId);

      expect(result).toHaveLength(1);
      expect(result[0].lastMessage).toBeNull();
    });
  });
});

