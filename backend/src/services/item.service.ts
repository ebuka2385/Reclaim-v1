// All code written in this file was created by Ethan Hunt and is completely original in terms of its use. I used several resources to help aid my coding process as I have never used Prisma or TypeScript before.

// All comments were created by AI after the code was written. The prompt was "Add comments to the item service file"

import { PrismaClient, Prisma, Item as DataItem, ItemStatus as PrismaItemStatus, Archive as DataArchive} from "@prisma/client";

import type { CreateItemDto, UpdateItemDto, ItemFilter, MapPin} from "../types/item.types";
import { ItemStatus as DtoItemStatus } from "../types/item.types";
import { notificationService } from "./notification.service";

const prisma = new PrismaClient();

export class ItemService {
  async getAllItems(): Promise<DataItem[]> {
    const sortDirection: Prisma.SortOrder = "desc";
    const items = await prisma.item.findMany({
      orderBy: { createdAt: sortDirection },
    });
    return items;
  }

  // gets all items that have been reported by a specific user based on the user"s id
  async getItemsByUser(userId: string): Promise<DataItem[]> {
    const sortDirection: Prisma.SortOrder = "desc";
    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { createdAt: sortDirection },
    });
    return items;
  }

  // returns the item by the given itemId
  async getItemById(id: string): Promise<DataItem | null> {
    return prisma.item.findUnique({
       where: { itemId: id } 
    });
  }

  // creates a new item using the CreateItemDto
  async createItem(data: CreateItemDto): Promise<DataItem> {
    const item = await (prisma as any).item.create({ data: {
      title: data.title,
      description: data.description,
      status: data.status as PrismaItemStatus,
      userId: data.userId,
      latitude: data.latitude,
      longitude: data.longitude,
    } });

    // Send notification when item is created
    try {
      const statusText = data.status === 'LOST' ? 'lost' : 'found';
      const notificationMessage = `Your ${statusText} item "${data.title}" has been posted successfully!`;
      
      // Send push notification (non-blocking)
      try {
        await notificationService.sendPushNotification(
          data.userId,
          "Item Posted Successfully! ✅",
          notificationMessage,
          {
            type: "item_created",
            itemId: item.itemId,
            itemTitle: item.title,
            status: data.status,
          }
        );
      } catch (pushError) {
        // Silently fail - don't block item creation
      }

      // Store notification in database for in-app notifications tab
      try {
        await notificationService.createNotification(data.userId, notificationMessage);
      } catch (dbError) {
        // Silently fail - don't block item creation
      }
    } catch (error) {
      // Silently fail - don't block item creation
    }

    return item;
  }

  // updates the item status from the item"s id and based on the new status
  async updateItemStatus(id: string, status: DtoItemStatus): Promise<DataItem | null> {
    try {
      const item = await prisma.item.update({ 
        where: { itemId: id }, 
        data: { status: status as PrismaItemStatus } 
      });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return null;
      }
      throw error;
    }
  }

  // updates an item"s title, description, and/or status
  async updateItem(id: string, data: UpdateItemDto): Promise<DataItem | null> {
    try {
      const updateData: Prisma.ItemUpdateInput = {};
      if (data.title != undefined) {
        updateData.title = data.title;
      }
      if (data.description != undefined) {
        updateData.description = data.description;
      }
      if (data.status != undefined) {
        updateData.status = data.status as PrismaItemStatus;
      }
      
      const item = await prisma.item.update({
        where: { itemId: id },
        data: updateData,
      });
      return item;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
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
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        return false;
      }
      throw error;
    }
  }

  // lists all items based on the filter input's type
  async listItems(filter: ItemFilter): Promise<DataItem[]> {
    const where: Prisma.ItemWhereInput = {};
    if (filter.status) {
      where.status = filter.status as PrismaItemStatus;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    let sortBy = "createdAt";
    if (filter.sortBy) {
      sortBy = filter.sortBy;
    } else {
      sortBy = "createdAt";
    }
    let sortOrder: Prisma.SortOrder = "desc";
    if (filter.sortOrder == "asc" || filter.sortOrder == "desc") {
      sortOrder = filter.sortOrder;
    }
    const orderBy: Prisma.ItemOrderByWithRelationInput = { [sortBy]: sortOrder };
    const items = await prisma.item.findMany({ where, orderBy });
    return items;
  }

  // archives an item based on the item id
  async archiveItem(itemId: string): Promise<DataArchive | null> {
    const item = await prisma.item.findUnique({ where: { itemId: itemId } });
    if (item == null) {
      return null;}
    const archiveData: { itemId: string } = { itemId: itemId };
    const archive = await prisma.archive.create({ data: archiveData });
    return archive;
  }

  // retrieves the map pins for all items (only items with coordinates)
  async getMapPins(): Promise<MapPin[]> {
    const items = await (prisma as any).item.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
    });
    
    return items.map((item: any) => ({
      itemId: item.itemId,
      title: item.title,
      description: item.description,
      status: item.status as DtoItemStatus,
      latitude: item.latitude!,
      longitude: item.longitude!,
    }));
  }
}

export const itemService = new ItemService();

