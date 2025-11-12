import { Router } from "express";
import { itemController } from "../controllers/item.controller";

const router: Router = Router();

// GET /items - Gets all items
router.get("/", (req, res) => itemController.getAllItems(req, res));

//GET /items/filter - Get items with filter
router.get("/filter", (req, res) => itemController.listItems(req, res));

// POST /items - Creates new item
router.post("/", (req, res) => itemController.createItem(req, res));

// PATCH /items/:id/status - Updates item status
router.patch("/:id/status", (req, res) => itemController.updateItemStatus(req, res));

// PATCH /items/:id - Updates the item
router.patch("/:id", (req, res) => itemController.updateItem(req, res));

//GET /items/:id - Get item by ID
router.get("/:id", (req, res) => itemController.getItemById(req, res));

//DELETE /items/:id - Deletes the item
router.delete("/:id", (req, res) => itemController.deleteItem(req, res));

export default router;

