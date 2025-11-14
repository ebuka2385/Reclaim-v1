import { apiService } from '../api';

// Mock fetch globally
global.fetch = jest.fn();

const API_BASE_URL = 'http://172.20.152.210:3000';

describe('ApiService Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('Item Operations', () => {
    it('should create item with location', async () => {
      const itemData = {
        title: 'Test Item',
        description: 'Test Description',
        status: 'FOUND' as const,
        latitude: 37.7749,
        longitude: -122.4194,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          itemId: '123',
          ...itemData,
        }),
      });

      const result = await apiService.createItem(itemData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.itemId).toBe('123');
    });

    it('should update item', async () => {
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        status: 'FOUND' as const,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          itemId: '123',
          ...updateData,
        }),
      });

      const result = await apiService.updateItem('123', updateData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items/123`,
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.title).toBe('Updated Title');
    });

    it('should delete item', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiService.deleteItem('123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/items/123`,
        expect.objectContaining({
          method: 'DELETE',
        })
      );
      expect(result).toBe(true);
    });

    it('should get map pins with location filter', async () => {
      const mockPins = [
        {
          itemId: '1',
          title: 'Item 1',
          description: 'Desc 1',
          status: 'FOUND' as const,
          latitude: 37.7749,
          longitude: -122.4194,
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ pins: mockPins }),
      });

      const result = await apiService.getMapPins();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/items/map/pins`);
      expect(result).toEqual(mockPins);
      expect(result[0]).toHaveProperty('latitude');
      expect(result[0]).toHaveProperty('longitude');
    });
  });

  describe('Claim Operations', () => {
    it('should create claim', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          claimId: 'claim-1',
          itemId: 'item-1',
          claimerId: 'temp-user-id',
        }),
      });

      const result = await apiService.createClaim('item-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/claims`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.claimId).toBe('claim-1');
    });

    it('should approve claim', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiService.approveClaim('claim-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/claims/claim-1/approve`,
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should deny claim', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await apiService.denyClaim('claim-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/claims/claim-1/deny`,
        expect.objectContaining({
          method: 'PATCH',
        })
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('Messaging Operations', () => {
    it('should get conversations', async () => {
      const mockConversations = [
        {
          threadId: 'thread-1',
          claim: { claimId: 'claim-1' },
          lastMessage: { text: 'Hello' },
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ conversations: mockConversations }),
      });

      const result = await apiService.getConversations();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/messages/user/temp-user-id`
      );
      expect(result).toEqual(mockConversations);
    });

    it('should get messages', async () => {
      const mockMessages = [
        {
          messageId: 'msg-1',
          text: 'Hello',
          userId: 'user-1',
          createdAt: new Date().toISOString(),
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: mockMessages }),
      });

      const result = await apiService.getMessages('thread-1');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/messages/threads/thread-1?userId=temp-user-id`
      );
      expect(result).toEqual(mockMessages);
    });

    it('should send message', async () => {
      const messageData = {
        text: 'Hello, is this available?',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          messageId: 'msg-1',
          ...messageData,
        }),
      });

      const result = await apiService.sendMessage('thread-1', messageData.text);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/messages/threads/thread-1`,
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(result.messageId).toBe('msg-1');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully for getMapPins', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await apiService.getMapPins();
      expect(result).toEqual([]);
    });

    it('should handle HTTP errors with JSON response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Item not found' }),
      });

      await expect(apiService.updateItem('123', { title: 'Test' })).rejects.toThrow();
    });

    it('should handle HTTP errors with HTML response', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => '<html><body>Error</body></html>',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(apiService.updateItem('123', { title: 'Test' })).rejects.toThrow();
    });
  });
});

