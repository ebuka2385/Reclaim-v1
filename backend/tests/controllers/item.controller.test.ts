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
        error: 'Invalid status. Must be LOST, FOUND, or CLAIMED' 
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
      expect(responseJson).toHaveBeenCalledWith({ error: 'Item not found' });
    });
  });
});