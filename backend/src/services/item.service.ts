import { PrismaClient } from '@prisma/client';
import { Item, CreateItemDto, ItemStatus } from '../types/item.types';

const prisma = new PrismaClient();

export class ItemService {
  // Get all items (mock data for now)
  async getAllItems(): Promise<Item[]> {
    // TODO: Replace with actual Prisma query when ready
    // const items = await prisma.item.findMany({ include: { user: true } });
    
    return [
      {
        id: '1',
        title: 'Blue Backpack',
        description: 'Lost near library, has a laptop inside',
        status: ItemStatus.LOST,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'iPhone 15 Pro',
        description: 'Found in cafeteria, black case',
        status: ItemStatus.FOUND,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: 'Student ID Card',
        description: 'Found near gym entrance',
        status: ItemStatus.FOUND,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Get item by ID
  async getItemById(id: string): Promise<Item | null> {
    // TODO: Replace with actual Prisma query
    // const item = await prisma.item.findUnique({ where: { id }, include: { user: true } });
    
    const items = await this.getAllItems();
    return items.find((item) => item.id === id) || null;
  }

  // Create new item
  async createItem(data: CreateItemDto): Promise<Item> {
    // TODO: Replace with actual Prisma query
    // const item = await prisma.item.create({ data: { ...data, userId } });
    
    return {
      id: Math.random().toString(36).substring(7),
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date().toISOString(),
    };
  }

  // Update item status
  async updateItemStatus(id: string, status: ItemStatus): Promise<Item | null> {
    // TODO: Replace with actual Prisma query
    // const item = await prisma.item.update({ where: { id }, data: { status } });
    
    const item = await this.getItemById(id);
    if (!item) return null;
    
    return {
      ...item,
      status,
    };
  }

  // Delete item
  async deleteItem(id: string): Promise<boolean> {
    // TODO: Replace with actual Prisma query
    // await prisma.item.delete({ where: { id } });
    
    return true;
  }
}

export const itemService = new ItemService();

