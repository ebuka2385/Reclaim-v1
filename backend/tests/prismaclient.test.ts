import { prisma } from '/Users/hboadi/Desktop/Reclaim-v1/backend/__mocks__/prismaClient.ts';

describe('Prisma Client Methods', () => {
  it('should create a notification', async () => {
    const mockNotification = {
      notificationId: '1',
      userId: '123',
      message: 'Test notification',
      timestamp: new Date(),
      read: false,
    };

    prisma.notification.create.mockResolvedValue(mockNotification);

    const result = await prisma.notification.create({
      data: {
        userId: '123',
        message: 'Test notification',
      },
    });

    expect(result).toEqual(mockNotification);
    expect(prisma.notification.create).toHaveBeenCalledWith({
      data: {
        userId: '123',
        message: 'Test notification',
      },
    });
  });
});