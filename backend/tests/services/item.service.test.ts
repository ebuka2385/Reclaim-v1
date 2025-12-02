import { prisma } from '../../__mocks__/prismaclient';

// Mock Prisma Client before importing the service
jest.mock('@prisma/client', () => {
  const mockPrisma = require('../../__mocks__/prismaclient').prisma;
  
  // Create a mock PrismaClientKnownRequestError class
  class MockPrismaClientKnownRequestError extends Error {
    code: string;
    meta?: any;
    constructor(message: string, code: string, meta?: any) {
      super(message);
      this.name = 'PrismaClientKnownRequestError';
      this.code = code;
      this.meta = meta;
    }
  }

  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      PrismaClientKnownRequestError: MockPrismaClientKnownRequestError,
      SortOrder: {
        asc: 'asc',
        desc: 'desc',
      },
    },
  };
});

// Import service after mocking Prisma
import { itemService } from '../../src/services/item.service';
import { ItemStatus } from '../../src/types/item.types';

describe('ItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllItems', () => {
    it('should return all items', async () => {
      const mockItems = [
        {
          itemId: 'item-1',
          title: 'Item 1',
          description: 'Description 1',
          status: ItemStatus.LOST,
          userId: 'user-1',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-2',
          title: 'Item 2',
          description: 'Description 2',
          status: ItemStatus.FOUND,
          userId: 'user-2',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.getAllItems();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getItemById', () => {
    it('should return null for non-existent item', async () => {
      (prisma.item.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await itemService.getItemById('nonexistent');
      
      expect(result).toBeNull();
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { itemId: 'nonexistent' },
      });
    });

    it('should return item for valid ID format', async () => {
      const validId = 'test-id-123';
      const mockItem = {
        itemId: validId,
        title: 'Test Item',
        description: 'Test Description',
        status: ItemStatus.FOUND,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.getItemById(validId);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty('itemId', validId);
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('status');
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { itemId: validId },
      });
    });
  });

  describe('createItem', () => {
    it('should create item with required fields', async () => {
      const createData = {
        title: 'Lost Phone',
        description: 'iPhone 14 Pro',
        status: ItemStatus.LOST,
        userId: 'temp-user-id',
      };

      const mockCreatedItem = {
        itemId: 'generated-id-123',
        title: createData.title,
        description: createData.description,
        status: createData.status,
        userId: createData.userId,
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.create as jest.Mock).mockResolvedValue(mockCreatedItem);

      const result = await itemService.createItem(createData);

      expect(result).toMatchObject({
        title: createData.title,
        description: createData.description,
        status: createData.status,
        userId: createData.userId,
      });
      expect(result.itemId).toBeDefined();
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(prisma.item.create).toHaveBeenCalledWith({
        data: {
          title: createData.title,
          description: createData.description,
          status: createData.status,
          userId: createData.userId,
          latitude: undefined,
          longitude: undefined,
        },
      });
    });

    it('should create item with generated itemId', async () => {
      const createData = {
        title: 'Found Keys',
        description: 'House keys with blue keychain',
        status: ItemStatus.FOUND,
        userId: 'temp-user-id',
      };

      const mockCreatedItem = {
        itemId: 'generated-item-id',
        ...createData,
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.create as jest.Mock).mockResolvedValue(mockCreatedItem);

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
          userId: 'temp-user-id',
        };

        const mockCreatedItem = {
          itemId: `item-${status}`,
          ...createData,
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        };

        (prisma.item.create as jest.Mock).mockResolvedValue(mockCreatedItem);

        const result = await itemService.createItem(createData);
        expect(result.status).toBe(status);
      }
    });
  });

  describe('updateItemStatus', () => {
    it('should update item status', async () => {
      const itemId = 'test-item-123';
      const newStatus = ItemStatus.FOUND;

      const mockUpdatedItem = {
        itemId,
        title: 'Updated Item',
        description: 'Description',
        status: newStatus,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItemStatus(itemId, newStatus);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty('itemId', itemId);
      expect(result).toHaveProperty('status', newStatus);
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: { status: newStatus },
      });
    });

    it('should return null when item does not exist', async () => {
      const itemId = 'non-existent-item';
      const newStatus = ItemStatus.FOUND;

      // Import Prisma to get the mocked error class
      const { Prisma } = require('@prisma/client');
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        'P2025',
        { cause: 'Record not found' }
      );
      (prisma.item.update as jest.Mock).mockRejectedValue(prismaError);

      const result = await itemService.updateItemStatus(itemId, newStatus);

      expect(result).toBeNull();
    });

    it('should throw error when non-Prisma error occurs', async () => {
      const itemId = 'item-id';
      const newStatus = ItemStatus.FOUND;

      const genericError = new Error('Database connection failed');
      (prisma.item.update as jest.Mock).mockRejectedValue(genericError);

      await expect(itemService.updateItemStatus(itemId, newStatus)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete item by ID', async () => {
      const itemId = 'test-item-to-delete';

      (prisma.item.delete as jest.Mock).mockResolvedValue({});

      const result = await itemService.deleteItem(itemId);

      expect(result).toBe(true);
      expect(prisma.item.delete).toHaveBeenCalledWith({
        where: { itemId },
      });
    });

    it('should return false when item does not exist', async () => {
      const itemId = 'non-existent-item';

      // Import Prisma to get the mocked error class
      const { Prisma } = require('@prisma/client');
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        'P2025',
        { cause: 'Record not found' }
      );
      (prisma.item.delete as jest.Mock).mockRejectedValue(prismaError);

      const result = await itemService.deleteItem(itemId);

      expect(result).toBe(false);
    });

    it('should throw error when non-Prisma error occurs', async () => {
      const itemId = 'item-id';

      const genericError = new Error('Database connection failed');
      (prisma.item.delete as jest.Mock).mockRejectedValue(genericError);

      await expect(itemService.deleteItem(itemId)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('updateItem', () => {
    it('should update item title', async () => {
      const itemId = 'item-id';
      const updateData = {
        title: 'Updated Title',
      };

      const mockUpdatedItem = {
        itemId,
        title: 'Updated Title',
        description: 'Original Description',
        status: ItemStatus.FOUND,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('Updated Title');
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: { title: 'Updated Title' },
      });
    });

    it('should update item description', async () => {
      const itemId = 'item-id';
      const updateData = {
        description: 'Updated Description',
      };

      const mockUpdatedItem = {
        itemId,
        title: 'Original Title',
        description: 'Updated Description',
        status: ItemStatus.LOST,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).not.toBeNull();
      expect(result?.description).toBe('Updated Description');
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: { description: 'Updated Description' },
      });
    });

    it('should update item status', async () => {
      const itemId = 'item-id';
      const updateData = {
        status: ItemStatus.CLAIMED,
      };

      const mockUpdatedItem = {
        itemId,
        title: 'Item Title',
        description: 'Description',
        status: ItemStatus.CLAIMED,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(ItemStatus.CLAIMED);
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: { status: ItemStatus.CLAIMED },
      });
    });

    it('should update multiple fields at once', async () => {
      const itemId = 'item-id';
      const updateData = {
        title: 'New Title',
        description: 'New Description',
        status: ItemStatus.FOUND,
      };

      const mockUpdatedItem = {
        itemId,
        title: 'New Title',
        description: 'New Description',
        status: ItemStatus.FOUND,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).not.toBeNull();
      expect(result?.title).toBe('New Title');
      expect(result?.description).toBe('New Description');
      expect(result?.status).toBe(ItemStatus.FOUND);
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: {
          title: 'New Title',
          description: 'New Description',
          status: ItemStatus.FOUND,
        },
      });
    });

    it('should return null when item does not exist', async () => {
      const itemId = 'non-existent-item';
      const updateData = {
        title: 'New Title',
      };

      // Import Prisma to get the mocked error class
      const { Prisma } = require('@prisma/client');
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        'P2025',
        { cause: 'Record not found' }
      );
      (prisma.item.update as jest.Mock).mockRejectedValue(prismaError);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).toBeNull();
    });

    it('should throw error when non-Prisma error occurs', async () => {
      const itemId = 'item-id';
      const updateData = {
        title: 'New Title',
      };

      const genericError = new Error('Database connection failed');
      (prisma.item.update as jest.Mock).mockRejectedValue(genericError);

      await expect(itemService.updateItem(itemId, updateData)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle empty update data', async () => {
      const itemId = 'item-id';
      const updateData = {};

      const mockItem = {
        itemId,
        title: 'Original Title',
        description: 'Original Description',
        status: ItemStatus.FOUND,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      (prisma.item.update as jest.Mock).mockResolvedValue(mockItem);

      const result = await itemService.updateItem(itemId, updateData);

      expect(result).not.toBeNull();
      expect(prisma.item.update).toHaveBeenCalledWith({
        where: { itemId },
        data: {},
      });
    });
  });

  describe('IST-9: listItems', () => {
    it('should filter items by status', async () => {
      const filter = {
        status: ItemStatus.LOST,
      };

      const mockItems = [
        {
          itemId: 'item-1',
          title: 'Lost Phone',
          description: 'iPhone',
          status: ItemStatus.LOST,
          userId: 'user-1',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-2',
          title: 'Lost Wallet',
          description: 'Black wallet',
          status: ItemStatus.LOST,
          userId: 'user-2',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.listItems(filter);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.status === ItemStatus.LOST)).toBe(true);
      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ItemStatus.LOST },
        })
      );
    });

    it('should filter items by userId', async () => {
      const filter = {
        userId: 'user-123',
      };

      const mockItems = [
        {
          itemId: 'item-1',
          title: 'My Item',
          description: 'Description',
          status: ItemStatus.FOUND,
          userId: 'user-123',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.listItems(filter);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user-123');
      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-123' },
        })
      );
    });

    it('should sort items by createdAt descending by default', async () => {
      const filter = {};

      const mockItems = [
        {
          itemId: 'item-2',
          title: 'Newer Item',
          createdAt: new Date('2024-01-02'),
          status: ItemStatus.FOUND,
          userId: 'user-1',
          description: 'Desc',
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-1',
          title: 'Older Item',
          createdAt: new Date('2024-01-01'),
          status: ItemStatus.LOST,
          userId: 'user-1',
          description: 'Desc',
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.listItems(filter);

      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should sort items by custom sortBy and sortOrder', async () => {
      const filter = {
        sortBy: 'title' as const,
        sortOrder: 'asc' as const,
      };

      const mockItems = [
        {
          itemId: 'item-1',
          title: 'A Item',
          createdAt: new Date(),
          status: ItemStatus.FOUND,
          userId: 'user-1',
          description: 'Desc',
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-2',
          title: 'Z Item',
          createdAt: new Date(),
          status: ItemStatus.LOST,
          userId: 'user-1',
          description: 'Desc',
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      await itemService.listItems(filter);

      expect(prisma.item.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { title: 'asc' },
        })
      );
    });

    it('should combine multiple filters', async () => {
      const filter = {
        status: ItemStatus.FOUND,
        userId: 'user-123',
        sortBy: 'createdAt' as const,
        sortOrder: 'desc' as const,
      };

      const mockItems = [
        {
          itemId: 'item-1',
          title: 'Found Item',
          description: 'Description',
          status: ItemStatus.FOUND,
          userId: 'user-123',
          createdAt: new Date(),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.listItems(filter);

      expect(result).toHaveLength(1);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: {
          status: ItemStatus.FOUND,
          userId: 'user-123',
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('IST-10: archiveItem', () => {
    it('should archive an item when item exists', async () => {
      const itemId = 'item-to-archive';

      const mockItem = {
        itemId,
        title: 'Item to Archive',
        description: 'Description',
        status: ItemStatus.FOUND,
        userId: 'user-1',
        createdAt: new Date(),
        latitude: null,
        longitude: null,
      };

      const mockArchive = {
        archiveId: 'archive-1',
        itemId,
        createdAt: new Date(),
      };

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(mockItem);
      (prisma.archive.create as jest.Mock).mockResolvedValue(mockArchive);

      const result = await itemService.archiveItem(itemId);

      expect(result).not.toBeNull();
      expect(result?.itemId).toBe(itemId);
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { itemId },
      });
      expect(prisma.archive.create).toHaveBeenCalledWith({
        data: { itemId },
      });
    });

    it('should return null when item does not exist', async () => {
      const itemId = 'non-existent-item';

      (prisma.item.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await itemService.archiveItem(itemId);

      expect(result).toBeNull();
      expect(prisma.item.findUnique).toHaveBeenCalledWith({
        where: { itemId },
      });
      expect(prisma.archive.create).not.toHaveBeenCalled();
    });
  });

  describe('IST-11: getMapPins', () => {
    it('should return map pins for items with coordinates', async () => {
      const mockItems = [
        {
          itemId: 'item-1',
          title: 'Lost Phone',
          description: 'iPhone',
          status: ItemStatus.LOST,
          latitude: 41.5045,
          longitude: -81.6084,
          userId: 'user-1',
          createdAt: new Date(),
        },
        {
          itemId: 'item-2',
          title: 'Found Wallet',
          description: 'Black wallet',
          status: ItemStatus.FOUND,
          latitude: 41.5050,
          longitude: -81.6090,
          userId: 'user-2',
          createdAt: new Date(),
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.getMapPins();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        itemId: 'item-1',
        title: 'Lost Phone',
        description: 'iPhone',
        status: ItemStatus.LOST,
        latitude: 41.5045,
        longitude: -81.6084,
      });
      expect(result[1]).toEqual({
        itemId: 'item-2',
        title: 'Found Wallet',
        description: 'Black wallet',
        status: ItemStatus.FOUND,
        latitude: 41.5050,
        longitude: -81.6090,
      });
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
      });
    });

    it('should exclude items without coordinates', async () => {
      const mockItems = [
        {
          itemId: 'item-1',
          title: 'Item with coords',
          description: 'Description',
          status: ItemStatus.LOST,
          latitude: 41.5045,
          longitude: -81.6084,
          userId: 'user-1',
          createdAt: new Date(),
        },
        {
          itemId: 'item-2',
          title: 'Item without coords',
          description: 'Description',
          status: ItemStatus.FOUND,
          latitude: null,
          longitude: null,
          userId: 'user-2',
          createdAt: new Date(),
        },
      ];

      // Only return items with coordinates
      (prisma.item.findMany as jest.Mock).mockResolvedValue([mockItems[0]]);

      const result = await itemService.getMapPins();

      expect(result).toHaveLength(1);
      expect(result[0].itemId).toBe('item-1');
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: {
          latitude: { not: null },
          longitude: { not: null },
        },
      });
    });

    it('should return empty array when no items have coordinates', async () => {
      (prisma.item.findMany as jest.Mock).mockResolvedValue([]);

      const result = await itemService.getMapPins();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });
  });

  describe('IST-12: getItemsByUser', () => {
    it('should return all items for a specific user', async () => {
      const userId = 'user-123';

      const mockItems = [
        {
          itemId: 'item-1',
          title: 'User Item 1',
          description: 'Description 1',
          status: ItemStatus.LOST,
          userId,
          createdAt: new Date('2024-01-02'),
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-2',
          title: 'User Item 2',
          description: 'Description 2',
          status: ItemStatus.FOUND,
          userId,
          createdAt: new Date('2024-01-01'),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.getItemsByUser(userId);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.userId === userId)).toBe(true);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return items sorted by createdAt descending', async () => {
      const userId = 'user-123';

      const mockItems = [
        {
          itemId: 'item-2',
          title: 'Newer Item',
          description: 'Description',
          status: ItemStatus.FOUND,
          userId,
          createdAt: new Date('2024-01-02'),
          latitude: null,
          longitude: null,
        },
        {
          itemId: 'item-1',
          title: 'Older Item',
          description: 'Description',
          status: ItemStatus.LOST,
          userId,
          createdAt: new Date('2024-01-01'),
          latitude: null,
          longitude: null,
        },
      ];

      (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

      const result = await itemService.getItemsByUser(userId);

      expect(result[0].itemId).toBe('item-2');
      expect(result[1].itemId).toBe('item-1');
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when user has no items', async () => {
      const userId = 'user-with-no-items';

      (prisma.item.findMany as jest.Mock).mockResolvedValue([]);

      const result = await itemService.getItemsByUser(userId);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
      expect(prisma.item.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});