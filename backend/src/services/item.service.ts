import { PrismaClient, Prisma, Item as DataItem } from '@prisma/client';
// If you also need your DTOs/enums, import them separately:
import type { CreateItemDto } from '../types/item.types';
import { ItemStatus as DtoItemStatus } from '../types/item.types';

const prisma = new PrismaClient();

export class ItemService {
  // Get all items (mock data for now)
  async getAllItems(): Promise<DataItem[]> {
    const sortDirection: Prisma.SortOrder = 'desc';

    const items = await prisma.item.findMany({
      orderBy: { createdAt: sortDirection },
    });
    
    return items;

  }

  // Get item by ID
  async getItemById(id: string): Promise<DataItem | null> {
    return prisma.item.findUnique({ where: { itemId: id } });
  }

  // Create new item
  async createItem(data: CreateItemDto): Promise<DataItem> {
    // TODO: Replace with actual Prisma query
    // const item = await prisma.item.create({ data: { ...data, userId } });
    
    return {
      itemId: Math.random().toString(36).substring(7),
      title: data.title,
      description: data.description,
      status: data.status,
      createdAt: new Date(),
      userId: data.userId,
    };
  }

  // Update item status
  async updateItemStatus(id: string, status: DtoItemStatus): Promise<DataItem | null> {
    // TODO: Replace with actual Prisma query
    // const item = await prisma.item.update({ where: { itemId: id }, data: { status } });
    
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
    // await prisma.item.delete({ where: { itemId: id } });
    
    return true;
  }
}

export const itemService = new ItemService();

