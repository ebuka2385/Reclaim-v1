import { Request, Response } from 'express';
import { itemService } from '../services/item.service';
import { CreateItemDto, ItemStatus } from '../types/item.types';

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
      
      const item = await itemService.createItem({ title, description, status, userId: req.body.userId });
      res.status(201).json(item);
    } catch (error) {
      console.error('❌ ItemController: createItem error:', error);
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

  // DELETE /items/:id - Delete item
  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await itemService.deleteItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
}

export const itemController = new ItemController();

