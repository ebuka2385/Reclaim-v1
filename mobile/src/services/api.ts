const API_BASE_URL = 'http://172.20.101.164:3000';
const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

export interface CreateItemRequest {
  title: string;
  description: string;
  status: 'LOST' | 'FOUND';
}

export interface UpdateItemRequest {
  title?: string;
  description?: string;
  status?: 'LOST' | 'FOUND' | 'CLAIMED';
}

class ApiService {
  async getAllItems() {
    const response = await fetch(`${API_BASE_URL}/items`);
    const data = await response.json();
    // Map itemId to id for consistency (backend uses itemId, frontend expects id)
    if (data.items) {
      data.items = data.items.map((item: any) => ({
        ...item,
        id: item.id || item.itemId,
      }));
    }
    return data;
  }

  async createItem(itemData: CreateItemRequest) {
    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...itemData,
        userId: DEFAULT_USER_ID // Automatically add default user ID
      }),
    });
    return response.json();
  }

  async updateItemStatus(id: string, status: 'LOST' | 'FOUND' | 'CLAIMED') {
    const response = await fetch(`${API_BASE_URL}/items/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return response.json();
  }

  async updateItem(id: string, itemData: UpdateItemRequest) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update item');
    }
    return data;
  }

  async deleteItem(id: string) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete item' }));
      throw new Error(error.error || 'Failed to delete item');
    }
    return true;
  }
}

export const apiService = new ApiService();
