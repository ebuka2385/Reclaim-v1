import request from 'supertest';
import express from 'express';
import routes from '../../src/routes';
import { itemService } from '../../src/services/item.service';
import { claimService } from '../../src/services/claim.service';
import { messagingService } from '../../src/services/messaging.service';

// Mock the services to avoid database calls
jest.mock('../../src/services/item.service');
jest.mock('../../src/services/claim.service');
jest.mock('../../src/services/messaging.service');

// Create test app with actual routes
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/', routes);
  return app;
};

describe('Routes Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
    jest.clearAllMocks();
    
    // Set up default mock return values for itemService
    (itemService.getAllItems as jest.Mock).mockResolvedValue([]);
    (itemService.getItemById as jest.Mock).mockResolvedValue(null);
    (itemService.createItem as jest.Mock).mockResolvedValue({
      itemId: 'test-item-id',
      title: 'Test Item',
      description: 'Test Description',
      status: 'LOST',
      userId: 'test-user-id',
      createdAt: new Date(),
    });
    (itemService.updateItemStatus as jest.Mock).mockResolvedValue({
      itemId: 'test-item-id',
      title: 'Test Item',
      description: 'Test Description',
      status: 'FOUND',
      userId: 'test-user-id',
      createdAt: new Date(),
    });
    (itemService.deleteItem as jest.Mock).mockResolvedValue(true);
    (itemService.listItems as jest.Mock).mockResolvedValue([]);
    (itemService.getMapPins as jest.Mock).mockResolvedValue([]);
    (itemService.updateItem as jest.Mock).mockResolvedValue({
      itemId: 'test-item-id',
      title: 'Updated Item',
      description: 'Updated Description',
      status: 'FOUND',
      userId: 'test-user-id',
      createdAt: new Date(),
    });
    
    // Set up default mock return values for claimService
    (claimService.getClaimsByUser as jest.Mock).mockResolvedValue([]);
    (claimService.createClaim as jest.Mock).mockResolvedValue({
      claimId: 'test-claim-id',
      itemId: 'test-item-id',
      claimerId: 'test-user-id',
      finderId: 'finder-id',
      status: 'OPEN',
      handedOff: false,
      createdAt: new Date(),
    });
    (claimService.approveClaim as jest.Mock).mockResolvedValue({
      claimId: 'test-claim-id',
      status: 'ACCEPTED',
    });
    (claimService.denyClaim as jest.Mock).mockResolvedValue({
      claimId: 'test-claim-id',
      status: 'DECLINED',
    });
    (claimService.markHandedOff as jest.Mock).mockResolvedValue({
      claimId: 'test-claim-id',
      handedOff: true,
    });
    (claimService.confirmReceipt as jest.Mock).mockResolvedValue({
      claimId: 'test-claim-id',
    });
    
    // Set up default mock return values for messagingService
    (messagingService.getConversationsByUser as jest.Mock).mockResolvedValue([]);
    (messagingService.postMessage as jest.Mock).mockResolvedValue({
      messageId: 'test-message-id',
      threadId: 'test-thread-id',
      userId: 'test-user-id',
      text: 'Test message',
      createdAt: new Date(),
    });
    (messagingService.listMessages as jest.Mock).mockResolvedValue({
      messages: [],
      nextCursor: null,
    });
    (messagingService.ensureThread as jest.Mock).mockResolvedValue('test-thread-id');
  });

  describe('Item Routes', () => {
    describe('GET /items', () => {
      it('should route to getAllItems endpoint', async () => {
        const response = await request(app)
          .get('/items')
          .expect(200);

        // Route should be registered and return response
        expect(response.body).toBeDefined();
      });
    });

    describe('GET /items/:id', () => {
      it('should route to getItemById endpoint when item exists', async () => {
        const itemId = 'test-item-123';
        const mockItem = {
          itemId: itemId,
          title: 'Test Item',
          description: 'Test Description',
          status: 'LOST',
          userId: 'test-user-id',
          createdAt: new Date(),
        };
        
        (itemService.getItemById as jest.Mock).mockResolvedValueOnce(mockItem);
        
        const response = await request(app)
          .get(`/items/${itemId}`)
          .expect(200);

        // Route should be registered
        expect(response.body).toBeDefined();
        expect(itemService.getItemById).toHaveBeenCalledWith(itemId);
      });
      
      it('should return 404 when item not found', async () => {
        const itemId = 'nonexistent';
        
        (itemService.getItemById as jest.Mock).mockResolvedValueOnce(null);
        
        await request(app)
          .get(`/items/${itemId}`)
          .expect(404);
      });
    });

    describe('POST /items', () => {
      it('should route to createItem endpoint', async () => {
        const newItem = {
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          status: 'LOST',
          userId: 'test-user-id'
        };

        const mockCreatedItem = {
          itemId: 'new-item-id',
          ...newItem,
          createdAt: new Date(),
        };
        
        (itemService.createItem as jest.Mock).mockResolvedValueOnce(mockCreatedItem);

        const response = await request(app)
          .post('/items')
          .send(newItem)
          .expect(201);

        // Route should be registered
        expect(response.body).toBeDefined();
        expect(itemService.createItem).toHaveBeenCalled();
      });

      it('should handle JSON parsing', async () => {
        const newItem = {
          title: 'Found Keys',
          description: 'House keys',
          status: 'FOUND',
          userId: 'test-user-id'
        };

        const mockCreatedItem = {
          itemId: 'new-item-id',
          ...newItem,
          createdAt: new Date(),
        };
        
        (itemService.createItem as jest.Mock).mockResolvedValueOnce(mockCreatedItem);

        await request(app)
          .post('/items')
          .send(newItem)
          .set('Content-Type', 'application/json')
          .expect(201);
      });
    });

    describe('PATCH /items/:id/status', () => {
      it('should route to updateItemStatus endpoint', async () => {
        const itemId = 'test-item-123';
        const updateData = { status: 'FOUND' };

        const mockUpdatedItem = {
          itemId: itemId,
          title: 'Test Item',
          description: 'Test Description',
          status: 'FOUND',
          userId: 'test-user-id',
          createdAt: new Date(),
        };
        
        (itemService.updateItemStatus as jest.Mock).mockResolvedValueOnce(mockUpdatedItem);

        const response = await request(app)
          .patch(`/items/${itemId}/status`)
          .send(updateData)
          .expect(200);

        // Route should be registered
        expect(response.body).toBeDefined();
        expect(itemService.updateItemStatus).toHaveBeenCalled();
      });
    });

    describe('DELETE /items/:id', () => {
      it('should route to deleteItem endpoint', async () => {
        const itemId = 'test-item-123';

        await request(app)
          .delete(`/items/${itemId}`)
          .expect(204);
      });
    });

    describe('GET /items/filter', () => {
      it('should route to listItems endpoint', async () => {
        const response = await request(app)
          .get('/items/filter?status=FOUND')
          .expect(200);

        expect(response.body).toBeDefined();
        expect(itemService.listItems).toHaveBeenCalled();
      });
    });

    describe('GET /items/map/pins', () => {
      it('should route to getMapPins endpoint', async () => {
        const mockPins = [
          {
            itemId: 'pin-1',
            title: 'Test Pin',
            description: 'Test',
            status: 'FOUND',
            latitude: 40.7128,
            longitude: -74.0060,
          },
        ];
        
        (itemService.getMapPins as jest.Mock).mockResolvedValueOnce(mockPins);

        const response = await request(app)
          .get('/items/map/pins')
          .expect(200);

        expect(response.body).toBeDefined();
        expect(itemService.getMapPins).toHaveBeenCalled();
      });
    });

    describe('PATCH /items/:id', () => {
      it('should route to updateItem endpoint', async () => {
        const itemId = 'test-item-123';
        const updateData = {
          title: 'Updated Title',
          description: 'Updated Description',
        };

        const response = await request(app)
          .patch(`/items/${itemId}`)
          .send(updateData)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(itemService.updateItem).toHaveBeenCalled();
      });
    });
  });

  describe('Health Check Route', () => {
    it('should respond to GET /health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });
  });

  describe('Claim Routes', () => {
    describe('GET /claims/user/:userId', () => {
      it('should route to getClaimsByUser endpoint', async () => {
        const userId = 'test-user-id';
        
        const response = await request(app)
          .get(`/claims/user/${userId}`)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(claimService.getClaimsByUser).toHaveBeenCalledWith(userId);
      });
    });

    describe('POST /claims', () => {
      it('should route to createClaim endpoint', async () => {
        const claimData = {
          itemId: 'test-item-id',
          ownerId: 'test-user-id',
        };

        const response = await request(app)
          .post('/claims')
          .send(claimData)
          .expect(201);

        expect(response.body).toBeDefined();
        expect(claimService.createClaim).toHaveBeenCalled();
      });
    });

    describe('PATCH /claims/:id/approve', () => {
      it('should route to approveClaim endpoint', async () => {
        const claimId = 'test-claim-id';
        const approveData = { finderId: 'test-finder-id' };

        const response = await request(app)
          .patch(`/claims/${claimId}/approve`)
          .send(approveData)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(claimService.approveClaim).toHaveBeenCalled();
      });
    });

    describe('PATCH /claims/:id/deny', () => {
      it('should route to denyClaim endpoint', async () => {
        const claimId = 'test-claim-id';
        const denyData = { finderId: 'test-finder-id' };

        const response = await request(app)
          .patch(`/claims/${claimId}/deny`)
          .send(denyData)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(claimService.denyClaim).toHaveBeenCalled();
      });
    });

    describe('PATCH /claims/:id/handoff', () => {
      it('should route to markHandedOff endpoint', async () => {
        const claimId = 'test-claim-id';
        const handoffData = { finderId: 'test-finder-id' };

        const response = await request(app)
          .patch(`/claims/${claimId}/handoff`)
          .send(handoffData)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(claimService.markHandedOff).toHaveBeenCalled();
      });
    });

    describe('PATCH /claims/:id/confirm', () => {
      it('should route to confirmReceipt endpoint', async () => {
        const claimId = 'test-claim-id';
        const confirmData = { claimerId: 'test-claimer-id' };

        const response = await request(app)
          .patch(`/claims/${claimId}/confirm`)
          .send(confirmData)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(claimService.confirmReceipt).toHaveBeenCalled();
      });
    });
  });

  describe('Messaging Routes', () => {
    describe('GET /messages/user/:userId', () => {
      it('should route to getConversationsByUser endpoint', async () => {
        const userId = 'test-user-id';

        const response = await request(app)
          .get(`/messages/user/${userId}`)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(messagingService.getConversationsByUser).toHaveBeenCalledWith(userId);
      });
    });

    describe('POST /messages/threads/:threadId', () => {
      it('should route to postMessage endpoint', async () => {
        const threadId = 'test-thread-id';
        const messageData = {
          userId: 'test-user-id',
          text: 'Test message',
        };

        const response = await request(app)
          .post(`/messages/threads/${threadId}`)
          .send(messageData)
          .expect(201);

        expect(response.body).toBeDefined();
        expect(messagingService.postMessage).toHaveBeenCalled();
      });
    });

    describe('GET /messages/threads/:threadId', () => {
      it('should route to listMessages endpoint', async () => {
        const threadId = 'test-thread-id';

        const response = await request(app)
          .get(`/messages/threads/${threadId}?userId=test-user-id`)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(messagingService.listMessages).toHaveBeenCalled();
      });
    });

    describe('POST /messages/threads/claim/:claimId', () => {
      it('should route to ensureThread endpoint', async () => {
        const claimId = 'test-claim-id';

        const response = await request(app)
          .post(`/messages/threads/claim/${claimId}`)
          .expect(200);

        expect(response.body).toBeDefined();
        expect(messagingService.ensureThread).toHaveBeenCalledWith(claimId);
      });
    });
  });

  describe('Route Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      await request(app)
        .get('/non-existent-route')
        .expect(404);
    });

    it('should handle malformed JSON', async () => {
      await request(app)
        .post('/items')
        .send('{"malformed": json}')
        .set('Content-Type', 'application/json')
        .expect(400);
    });
  });

  describe('HTTP Methods', () => {
    it('should support GET requests', async () => {
      await request(app)
        .get('/items')
        .expect(200);
    });

    it('should support POST requests', async () => {
      const mockCreatedItem = {
        itemId: 'new-item-id',
        title: 'Test',
        description: 'Test description',
        status: 'LOST',
        userId: 'test-user-id',
        createdAt: new Date(),
      };
      
      (itemService.createItem as jest.Mock).mockResolvedValueOnce(mockCreatedItem);
      
      await request(app)
        .post('/items')
        .send({ title: 'Test', description: 'Test description', status: 'LOST', userId: 'test-user-id' })
        .expect(201);
    });

    it('should support PATCH requests', async () => {
      const mockUpdatedItem = {
        itemId: '123',
        title: 'Test Item',
        description: 'Test Description',
        status: 'FOUND',
        userId: 'test-user-id',
        createdAt: new Date(),
      };
      
      (itemService.updateItemStatus as jest.Mock).mockResolvedValueOnce(mockUpdatedItem);
      
      await request(app)
        .patch('/items/123/status')
        .send({ status: 'FOUND' })
        .expect(200);
    });

    it('should support DELETE requests', async () => {
      await request(app)
        .delete('/items/123')
        .expect(204);
    });
  });
});