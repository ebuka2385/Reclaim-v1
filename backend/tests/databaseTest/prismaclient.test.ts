import { prisma } from '../../__mocks__/prismaclient';

describe('Prisma Client Methods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Model', () => {
    it('should create a user', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await prisma.user.create({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
        },
      });
    });

    it('should find a user by email', async () => {
      const mockUser = {
        userId: 'user123',
        email: 'test@example.com',
        name: 'Test User',
        createdAt: new Date(),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await prisma.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });
  });

  describe('Item Model', () => {
    it('should create an item', async () => {
      const mockItem = {
        itemId: 'item123',
        title: 'Lost Phone',
        description: 'iPhone 14 Pro',
        status: 'LOST',
        createdAt: new Date(),
        userId: 'user123',
      };

      (prisma.item.create as jest.Mock).mockResolvedValue(mockItem);

      const result = await prisma.item.create({
        data: {
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          userId: 'user123',
        },
      });

      expect(result).toEqual(mockItem);
      expect(prisma.item.create).toHaveBeenCalledWith({
        data: {
          title: 'Lost Phone',
          description: 'iPhone 14 Pro',
          userId: 'user123',
        },
      });
    });

    // TODO: Implement these tests as you build more features
    it('should find items by status', async () => {
       const mockItems = [
        {
           itemId: 'item1',
           title: 'Lost Phone',
           description: 'iPhone 14 Pro',
           status: 'LOST',
           createdAt: new Date(),
           userId: 'user123',
         },
         {
           itemId: 'item2',
           title: 'Lost Wallet',
           description: 'Brown leather wallet',
           status: 'LOST',
           createdAt: new Date(),
           userId: 'user456',
         },
       ];

       (prisma.item.findMany as jest.Mock).mockResolvedValue(mockItems);

       const result = await prisma.item.findMany({
         where: { status: 'LOST' },
       });

       expect(result).toEqual(mockItems);
       expect(prisma.item.findMany).toHaveBeenCalledWith({
         where: { status: 'LOST' },
       });
     });

     it('should update item status', async () => {
       const mockUpdatedItem = {
         itemId: 'item123',
         title: 'Lost Phone',
         description: 'iPhone 14 Pro',
         status: 'FOUND',
         createdAt: new Date(),
         userId: 'user123',
       };

       (prisma.item.update as jest.Mock).mockResolvedValue(mockUpdatedItem);

       const result = await prisma.item.update({
         where: { itemId: 'item123' },
         data: { status: 'FOUND' },
       });

       expect(result).toEqual(mockUpdatedItem);
       expect(prisma.item.update).toHaveBeenCalledWith({
         where: { itemId: 'item123' },
         data: { status: 'FOUND' },
       });
     });
  });

  // In Progress: Tests for Notification model
  // describe('Notification Model', () => {
  //   // Notification tests 
  // });

  // In Progress: Tests for Archive model  
  // describe('Archive Model', () => {
  //   // Archive tests 
  // });

  describe('Database Connection', () => {
    it('should disconnect from database', async () => {
      (prisma.$disconnect as jest.Mock).mockResolvedValue(undefined);

      await prisma.$disconnect();

      expect(prisma.$disconnect).toHaveBeenCalled();
    });
  });
});