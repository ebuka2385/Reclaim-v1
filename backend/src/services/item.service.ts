import { PrismaClient, Prisma, Item as DataItem, ItemStatus as PrismaItemStatus, Archive as DataArchive} from '@prisma/client';

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

  // creates a new item using the CreateItemDto
  async createItem(data: CreateItemDto): Promise<DataItem> {
    return prisma.item.create({ data: {
      title: data.title,
      description: data.description,
      status: data.status as PrismaItemStatus,
      userId: data.userId,
    } });
  }

  // updates the item status from the item's id and based on the new status
  async updateItemStatus(id: string, status: DtoItemStatus): Promise<DataItem | null> {
    try {
      const item = await prisma.item.update({ 
        where: { itemId: id }, 
        data: { status: status as PrismaItemStatus } 
      });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  // deletes the item based on the itemId
  async deleteItem(id: string): Promise<boolean> {
    try {
      await prisma.item.delete({ where: { itemId: id } });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }

  // List items with filter: either status or userId or both
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

  // archives an item based on the item id 
  async archiveItem(itemId: string): Promise<DataArchive | null> {
    try {
      const item = await prisma.item.findUnique({ where: { itemId } });
      if (!item) {
        return null;
      }
      const archive = await prisma.archive.create({
        data: {
          itemId: itemId,
        },
      });
      return archive;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
        return null;
      }
      throw error;
    }
  }
}

export const itemService = new ItemService();

