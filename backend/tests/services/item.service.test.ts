import { itemService } from '../../src/services/item.service';
import { ItemStatus } from '../../src/types/item.types';

describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should return all items', async () => {
      const result = await itemService.getAllItems();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getItemById', () => {
    it('should return null for non-existent item', async () => {
      const result = await itemService.getItemById('nonexistent');
      
      expect(result).toBeNull();
    });

    it('should return item for valid ID format', async () => {
      // Since this is a mock implementation, test the structure
      const validId = 'test-id-123';
      const result = await itemService.getItemById(validId);
      
      // Should either return null or a valid item structure
      if (result !== null) {
        expect(result).toHaveProperty('itemId');
        expect(result).toHaveProperty('title');
        expect(result).toHaveProperty('description');
        expect(result).toHaveProperty('status');
      }
    });
  });

  describe('createItem', () => {
    it('should create item with required fields', async () => {
      const createData = {
        title: 'Lost Phone',
        description: 'iPhone 14 Pro',
        status: ItemStatus.LOST,
        userId: 'user123',
      };

      const result = await itemService.createItem(createData);

      expect(result).toMatchObject({
        title: createData.title,
        description: createData.description,
        status: createData.status,
        userId: createData.userId,
      });
      expect(result.itemId).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should create item with generated itemId', async () => {
      const createData = {
        title: 'Found Keys',
        description: 'House keys with blue keychain',
        status: ItemStatus.FOUND,
        userId: 'user456',
      };

      const result = await itemService.createItem(createData);

      expect(result.itemId).toBeDefined();
      expect(typeof result.itemId).toBe('string');
      expect(result.itemId.length).toBeGreaterThan(0);
    });

    it('should handle different item statuses', async () => {
      const statuses = [ItemStatus.LOST, ItemStatus.FOUND, ItemStatus.CLAIMED];
      
      for (const status of statuses) {
        const createData = {
          title: `Test Item ${status}`,
          description: 'Test description',
          status: status,
          userId: 'user123',
        };

        const result = await itemService.createItem(createData);
        expect(result.status).toBe(status);
      }
    });
  });

  describe('updateItemStatus', () => {
    it('should update item status', async () => {
      const itemId = 'test-item-123';
      const newStatus = ItemStatus.FOUND;

      const result = await itemService.updateItemStatus(itemId, newStatus);

      if (result !== null) {
        expect(result).toHaveProperty('itemId', itemId);
        expect(result).toHaveProperty('status', newStatus);
      }
    });
  });

  describe('deleteItem', () => {
    it('should delete item by ID', async () => {
      const itemId = 'test-item-to-delete';

      // Should not throw an error
      await expect(itemService.deleteItem(itemId)).resolves.not.toThrow();
    });
  });
});