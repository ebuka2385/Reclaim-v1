export const itemService = {
  getAllItems: jest.fn(),
  getItemById: jest.fn(),
  createItem: jest.fn(),
  updateItemStatus: jest.fn(),
  deleteItem: jest.fn(),
};

export class ItemService {
  getAllItems = itemService.getAllItems;
  getItemById = itemService.getItemById;
  createItem = itemService.createItem;
  updateItemStatus = itemService.updateItemStatus;
  deleteItem = itemService.deleteItem;
}