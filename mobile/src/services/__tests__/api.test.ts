import { apiService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockClear();
  });

  describe('getAllItems', () => {
    it('should fetch all items and map itemId to id', async () => {
      const mockItems = [
        { itemId: '1', title: 'Item 1', status: 'LOST' },
        { itemId: '2', title: 'Item 2', status: 'FOUND' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockItems }),
      });

      const result = await apiService.getAllItems();

      expect(fetch).toHaveBeenCalledWith('http://172.20.152.210:3000/items');
      expect(result.items).toHaveLength(2);
      expect(result.items[0].id).toBe('1');
      expect(result.items[1].id).toBe('2');
    });

    it('should handle empty items array', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      const result = await apiService.getAllItems();
      expect(result.items).toEqual([]);
    });
  });

  describe('createItem', () => {
    it('should create item with location', async () => {
      const itemData = {
        title: 'Test Item',
        description: 'Test Description',
        status: 'FOUND' as const,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      const mockResponse = {
        itemId: '123',
        ...itemData,
        userId: 'temp-user-id',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.createItem(itemData);

      expect(fetch).toHaveBeenCalledWith(
        'http://172.20.152.210:3000/items',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.itemId).toBe('123');
    });

    it('should create item without location', async () => {
      const itemData = {
        title: 'Test Item',
        description: 'Test Description',
        status: 'LOST' as const,
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ itemId: '123', ...itemData }),
      });

      await apiService.createItem(itemData);

      const callBody = JSON.parse((fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.latitude).toBeUndefined();
      expect(callBody.longitude).toBeUndefined();
    });

    it('should handle error response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to create item' }),
      });

      await expect(apiService.createItem({
        title: 'Test',
        description: 'Test',
        status: 'LOST',
      })).rejects.toThrow('Failed to create item');
    });
  });

  describe('getMapPins', () => {
    it('should fetch map pins successfully', async () => {
      const mockPins = [
        { itemId: '1', title: 'Pin 1', latitude: 37.7749, longitude: -122.4194 },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pins: mockPins }),
      });

      const result = await apiService.getMapPins();

      expect(fetch).toHaveBeenCalledWith('http://172.20.152.210:3000/items/map/pins');
      expect(result).toEqual(mockPins);
    });

    it('should return empty array on error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.getMapPins();
      expect(result).toEqual([]);
    });
  });

  describe('createClaim', () => {
    it('should create a claim', async () => {
      const mockClaim = {
        claimId: 'claim-123',
        itemId: 'item-123',
        status: 'OPEN',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClaim,
      });

      const result = await apiService.createClaim('item-123');

      expect(fetch).toHaveBeenCalledWith(
        'http://172.20.152.210:3000/claims',
        expect.objectContaining({
          method: 'POST',
        })
      );
      expect(result.claimId).toBe('claim-123');
    });
  });

  describe('getConversations', () => {
    it('should fetch conversations', async () => {
      const mockConversations = [
        { threadId: 'thread-1', claim: { claimId: 'claim-1' } },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });

      const result = await apiService.getConversations();

      expect(fetch).toHaveBeenCalledWith('http://172.20.152.210:3000/messages/user/temp-user-id');
      expect(result).toEqual(mockConversations);
    });

    it('should return empty array on error', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
      });

      const result = await apiService.getConversations();
      expect(result).toEqual([]);
    });
  });

  describe('getMessages', () => {
    it('should fetch messages with userId', async () => {
      const mockMessages = [
        { messageId: 'msg-1', text: 'Hello', userId: 'user-1' },
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      });

      const result = await apiService.getMessages('thread-1');

      expect(fetch).toHaveBeenCalledWith(
        'http://172.20.152.210:3000/messages/threads/thread-1?userId=temp-user-id'
      );
      expect(result).toEqual(mockMessages);
    });
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const mockMessage = {
        messageId: 'msg-1',
        text: 'Hello',
        threadId: 'thread-1',
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockMessage,
      });

      const result = await apiService.sendMessage('thread-1', 'Hello');

      expect(fetch).toHaveBeenCalledWith(
        'http://172.20.152.210:3000/messages/threads/thread-1',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            userId: 'temp-user-id',
            text: 'Hello',
          }),
        })
      );
      expect(result.messageId).toBe('msg-1');
    });
  });
});

