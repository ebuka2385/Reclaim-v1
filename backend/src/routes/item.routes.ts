import { Router } from 'express';
import { itemController } from '../controllers/item.controller';

const router: import('express').Router = Router();

// GET /items - Get all items
router.get('/', (req, res) => itemController.getAllItems(req, res));

// GET /items/:id - Get item by ID
router.get('/:id', (req, res) => itemController.getItemById(req, res));

// POST /items - Create new item
router.post('/', (req, res) => itemController.createItem(req, res));

// PATCH /items/:id/status - Update item status
router.patch('/:id/status', (req, res) => itemController.updateItemStatus(req, res));

// DELETE /items/:id - Delete item
router.delete('/:id', (req, res) => itemController.deleteItem(req, res));

export default router;

