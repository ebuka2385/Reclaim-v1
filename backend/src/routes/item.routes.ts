import { Router } from 'express';
import { itemController } from '../controllers/item.controller';

const router: Router = Router();

// GET /items - Get all items
router.get('/', (req, res) => itemController.getAllItems(req, res));

// GET /items/filter - Get items with filter
router.get('/filter', (req, res) => itemController.listItems(req, res));

// GET /items/map/pins - Get map pins
router.get('/map/pins', (req, res) => itemController.getMapPins(req, res));

// POST /items - Create new item
router.post('/', (req, res) => itemController.createItem(req, res));

// PATCH /items/:id/status - Update item status (must come before /:id)
router.patch('/:id/status', (req, res) => itemController.updateItemStatus(req, res));

// PATCH /items/:id - Update item (title, description, status)
router.patch('/:id', (req, res) => itemController.updateItem(req, res));

// GET /items/:id - Get item by ID (must come after PATCH routes)
router.get('/:id', (req, res) => itemController.getItemById(req, res));

// DELETE /items/:id - Delete item
router.delete('/:id', (req, res) => itemController.deleteItem(req, res));

export default router;

