import { Request, Response } from 'express';
import { itemService } from '../services/item.service';
import { CreateItemDto, UpdateItemDto, ItemStatus, ListItemFilter } from '../types/item.types';

export class ItemController {
  // GET /items - Get all items
  async getAllItems(_req: Request, res: Response): Promise<void> {
    try {
      const items = await itemService.getAllItems();
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch items' });
    }
  }

  // GET /items/filter - Get items with filter
  async listItems(req: Request, res: Response): Promise<void> {
    try {
      const validFilterKeys = ['status', 'userId', 'sortBy', 'sortOrder'];
      const queryKeys = Object.keys(req.query);
      
      for (const key of queryKeys) {
        if (!validFilterKeys.includes(key)) {
          res.status(400).json({ error: "Can't retrieve and filter items" });
          return;
        }
      }
      
      const filter: ListItemFilter = {};
      
      if (req.query.status) {
        const status = req.query.status as string;
        if (!Object.values(ItemStatus).includes(status as ItemStatus)) {
          res.status(400).json({ error: "Can't retrieve and filter items" });
          return;
        }
        filter.status = status as ItemStatus;
      }
      
      if (req.query.userId) {
        filter.userId = req.query.userId as string;
      }
      
      if (req.query.sortBy) {
        const sortBy = req.query.sortBy as string;
        const validSortBy = ['createdAt', 'title', 'status'];
        if (!validSortBy.includes(sortBy)) {
          res.status(400).json({ error: "Can't retrieve and filter items" });
          return;
        }
        filter.sortBy = sortBy as 'createdAt' | 'title' | 'status';
      }
      
      if (req.query.sortOrder) {
        const sortOrder = req.query.sortOrder as string;
        if (sortOrder !== 'asc' && sortOrder !== 'desc') {
          res.status(400).json({ error: "Can't retrieve and filter items" });
          return;
        }
        filter.sortOrder = sortOrder as 'asc' | 'desc';
      }
      
      const items = await itemService.listItems(filter);
      res.json({ items });
    } catch (error) {
      res.status(500).json({ error: "Can't retrieve and filter items" });
    }
  }

  // GET /items/:id - Get item by ID
  async getItemById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const item = await itemService.getItemById(id);
      
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch item' });
    }
  }

  // POST /items - Create new item
  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const { title, description, status } = req.body as CreateItemDto;

      if (!title || !description || !status) {
        res.status(400).json({ error: 'Missing required fields: title, description, status' });
        return;
      }

      if (!Object.values(ItemStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be LOST, FOUND, or CLAIMED' });
        return;
      }

      const item = await itemService.createItem({ title, description, status, userId: req.body.userId});
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create item' });
    }
  }

  // PATCH /items/:id/status - Update item status
  async updateItemStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: ItemStatus };
      
      if (!status || !Object.values(ItemStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be LOST, FOUND, or CLAIMED' });
        return;
      }
      
      const item = await itemService.updateItemStatus(id, status);
      
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item status' });
    }
  }

  // PATCH /items/:id - Update item (title, description, status)
  async updateItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, description, status } = req.body as UpdateItemDto;

      if (!title && !description && !status) {
        res.status(400).json({ error: 'At least one field (title, description, status) must be provided' });
        return;
      }

      if (status && !Object.values(ItemStatus).includes(status)) {
        res.status(400).json({ error: 'Invalid status. Must be LOST, FOUND, or CLAIMED' });
        return;
      }

      const item = await itemService.updateItem(id, { title, description, status });
      
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update item' });
    }
  }

  // DELETE /items/:id - Delete item
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await itemService.deleteItem(id);
      if (!deleted) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
}

export const itemController = new ItemController();

