import { PrismaClient, Prisma, Item as DataItem, ItemStatus as PrismaItemStatus} from '@prisma/client';

import type { CreateItemDto, ListItemFilter} from '../types/item.types';
import { ItemStatus as DtoItemStatus } from '../types/item.types';

const prisma = new PrismaClient();

export class ItemService {
  async getAllItems(): Promise<DataItem[]> {
    const sortDirection: Prisma.SortOrder = 'desc';
    const items = await prisma.item.findMany({
      orderBy: { createdAt: sortDirection },
    });
    return items;
  }

  // returns the item by the given itemId
  async getItemById(id: string): Promise<DataItem | null> {
    return prisma.item.findUnique({ where: { itemId: id } });
  }

  // Create new item
  async createItem(data: CreateItemDto): Promise<DataItem> {
    return prisma.item.create({ data: {
      title: data.title,
      description: data.description,
      status: data.status as PrismaItemStatus,
      userId: data.userId,
    } });
  }

  // Update item status
  async updateItemStatus(id: string, status: DtoItemStatus): Promise<DataItem | null> {
    try {
      const item = await prisma.item.update({ 
        where: { itemId: id }, 
        data: { status: status as PrismaItemStatus } 
      });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Record not found
        return null;
      }
      throw error;
    }
  }

  // Delete item
  async deleteItem(id: string): Promise<boolean> {
    try {
      await prisma.item.delete({ where: { itemId: id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        // Record not found
        return false;
      }
      throw error;
    }
  }

  // List items with filter
  async listItems(filter: ListItemFilter): Promise<DataItem[]> {
    const where: Prisma.ItemWhereInput = {};
    if (filter.status) {
      where.status = filter.status as PrismaItemStatus;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder: Prisma.SortOrder = filter.sortOrder || 'desc';
    const orderBy: Prisma.ItemOrderByWithRelationInput = {
      [sortBy]: sortOrder,
    };
    const items = await prisma.item.findMany({
      where,
      orderBy,
    });
    return items;
  }
}

export const itemService = new ItemService();

