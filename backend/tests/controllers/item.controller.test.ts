import { Request, Response } from 'express';
import { itemController } from '../../src/controllers/item.controller';
import { itemService } from '../../src/services/item.service';
import { ItemStatus } from '../../src/types/item.types';

// Mock the item service
jest.mock('../../src/services/item.service');

describe('ItemController', () => {
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

  describe('getAllItems', () => {
    it('should return all items successfully', async () => {
      const mockItems = [
        {
          itemId: 'item1',
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          status: ItemStatus.LOST,
          createdAt: new Date(),
          userId: 'user1',
        },
      ];

      (itemService.getAllItems as jest.Mock).mockResolvedValue(mockItems);

      await itemController.getAllItems(mockRequest as Request, mockResponse as Response);

      expect(itemService.getAllItems).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({ items: mockItems });
    });

    it('should handle service errors', async () => {
      (itemService.getAllItems as jest.Mock).mockRejectedValue(new Error('Database error'));

      await itemController.getAllItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to fetch items' });
    });
  });

  describe('createItem', () => {
    it('should create item with valid data', async () => {
      const mockItem = {
        itemId: 'item123',
        title: 'Lost Phone',
        description: 'iPhone 14 Pro',
        status: ItemStatus.LOST,
        createdAt: new Date(),
        userId: 'user123',
      };

      mockRequest = {
        body: {
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          status: ItemStatus.LOST,
        },
      };

      (itemService.createItem as jest.Mock).mockResolvedValue(mockItem);

      await itemController.createItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(201);
      expect(responseJson).toHaveBeenCalledWith(mockItem);
    });

    it('should validate required fields', async () => {
      mockRequest = {
        body: {
          title: 'Lost Phone',
          // Missing description and status
        },
      };

      await itemController.createItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        error: 'Missing required fields: title, description, status' 
      });
    });

    it('should validate item status', async () => {
      mockRequest = {
        body: {
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          status: 'INVALID_STATUS',
        },
      };

      await itemController.createItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ 
        error: 'Unfortunately, the status is invalid :( Must be LOST, FOUND, or CLAIMED' 
      });
    });
  });

  describe('getItemById', () => {
    it('should return item when found', async () => {
      const mockItem = {
        itemId: 'item123',
        title: 'Lost Phone',
        description: 'iPhone 14 Pro',
        status: ItemStatus.LOST,
        createdAt: new Date(),
        userId: 'user123',
      };

      mockRequest = { params: { id: 'item123' } };
      (itemService.getItemById as jest.Mock).mockResolvedValue(mockItem);

      await itemController.getItemById(mockRequest as Request, mockResponse as Response);

      expect(itemService.getItemById).toHaveBeenCalledWith('item123');
      expect(responseJson).toHaveBeenCalledWith(mockItem);
    });

    it('should return 404 when item not found', async () => {
      mockRequest = { params: { id: 'nonexistent' } };
      (itemService.getItemById as jest.Mock).mockResolvedValue(null);

      await itemController.getItemById(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: "Item wasn't able to be found" });
    });
  });

  describe('ICT-8: listItems', () => {
    it('should list items with valid filter', async () => {
      const mockItems = [
        {
          itemId: 'item1',
          title: 'Lost Phone',
          description: 'iPhone',
          status: ItemStatus.LOST,
          createdAt: new Date(),
          userId: 'user1',
        },
      ];

      mockRequest = {
        query: {
          status: ItemStatus.LOST,
        },
      };

      (itemService.listItems as jest.Mock).mockResolvedValue(mockItems);

      await itemController.listItems(mockRequest as Request, mockResponse as Response);

      expect(itemService.listItems).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({ items: mockItems });
    });
  });

  describe('ICT-9: listItems - filter errors', () => {
    it('should catch invalid filter keyword', async () => {
      mockRequest = {
        query: {
          invalidKey: 'value',
        },
      };

      await itemController.listItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: "Can't retrieve and filter items" });
      expect(itemService.listItems).not.toHaveBeenCalled();
    });

    it('should catch invalid status in filter', async () => {
      mockRequest = {
        query: {
          status: 'INVALID_STATUS',
        },
      };

      await itemController.listItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: "Can't retrieve and filter items" });
    });

    it('should catch service errors', async () => {
      mockRequest = {
        query: {
          status: ItemStatus.LOST,
        },
      };

      (itemService.listItems as jest.Mock).mockRejectedValue(new Error('Database error'));

      await itemController.listItems(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: "Can't retrieve and filter items" });
    });
  });

  describe('ICT-10: updateItemStatus', () => {
    it('should update item status successfully', async () => {
      const itemId = 'item-123';
      const newStatus = ItemStatus.FOUND;

      const mockUpdatedItem = {
        itemId,
        title: 'Updated Item',
        description: 'Description',
        status: newStatus,
        userId: 'user-1',
        createdAt: new Date(),
      };

      mockRequest = {
        params: { id: itemId },
        body: { status: newStatus },
      };

      (itemService.updateItemStatus as jest.Mock).mockResolvedValue(mockUpdatedItem);

      await itemController.updateItemStatus(mockRequest as Request, mockResponse as Response);

      expect(itemService.updateItemStatus).toHaveBeenCalledWith(itemId, newStatus);
      expect(responseJson).toHaveBeenCalledWith(mockUpdatedItem);
    });
  });

  describe('ICT-11: updateItemStatus - invalid status', () => {
    it('should catch invalid status error', async () => {
      mockRequest = {
        params: { id: 'item-123' },
        body: { status: 'INVALID_STATUS' },
      };

      await itemController.updateItemStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({
        error: 'Unfortunately, the status is invalid :( Must be LOST, FOUND, or CLAIMED',
      });
      expect(itemService.updateItemStatus).not.toHaveBeenCalled();
    });

    it('should return 404 when item not found', async () => {
      mockRequest = {
        params: { id: 'non-existent' },
        body: { status: ItemStatus.FOUND },
      };

      (itemService.updateItemStatus as jest.Mock).mockResolvedValue(null);

      await itemController.updateItemStatus(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Item not found' });
    });
  });

  describe('ICT-12: getMapPins', () => {
    it('should return map pins successfully', async () => {
      const mockPins = [
        {
          itemId: 'item-1',
          title: 'Lost Phone',
          description: 'iPhone',
          status: ItemStatus.LOST,
          latitude: 41.5045,
          longitude: -81.6084,
        },
      ];

      (itemService.getMapPins as jest.Mock).mockResolvedValue(mockPins);

      await itemController.getMapPins(mockRequest as Request, mockResponse as Response);

      expect(itemService.getMapPins).toHaveBeenCalled();
      expect(responseJson).toHaveBeenCalledWith({ pins: mockPins });
    });
  });

  describe('ICT-13: getMapPins - invalid coordinates', () => {
    it('should handle service errors', async () => {
      (itemService.getMapPins as jest.Mock).mockRejectedValue(new Error('Incomplete location data'));

      await itemController.getMapPins(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Failed to fetch map pins' });
    });
  });

  describe('ICT-18: deleteItem', () => {
    it('should delete item successfully', async () => {
      const itemId = 'item-to-delete';
      mockRequest = { params: { id: itemId } };

      (itemService.deleteItem as jest.Mock).mockResolvedValue(true);

      await itemController.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(itemService.deleteItem).toHaveBeenCalledWith(itemId);
      expect(responseStatus).toHaveBeenCalledWith(204);
    });
  });

  describe('ICT-19: deleteItem - 404 error', () => {
    it('should return 404 when item does not exist', async () => {
      const itemId = 'non-existent-item';
      mockRequest = { params: { id: itemId } };

      (itemService.deleteItem as jest.Mock).mockResolvedValue(false);

      await itemController.deleteItem(mockRequest as Request, mockResponse as Response);

      expect(responseStatus).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Item not found' });
    });
  });
});