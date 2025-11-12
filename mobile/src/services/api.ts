const API_BASE_URL = 'http://172.20.101.164:3000';
const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

export interface CreateItemRequest {
  title: string;
  description: string;
  status: 'LOST' | 'FOUND';
  latitude?: number;
  longitude?: number;
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
    const requestBody = {
      title: itemData.title,
      description: itemData.description,
      status: itemData.status,
      userId: DEFAULT_USER_ID,
      ...(itemData.latitude !== undefined && { latitude: itemData.latitude }),
      ...(itemData.longitude !== undefined && { longitude: itemData.longitude }),
    };

    const response = await fetch(`${API_BASE_URL}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to create item' }));
      throw new Error(errorData.error || 'Failed to create item');
    }

    const data = await response.json();
    // Map itemId to id if needed
    if (data.itemId && !data.id) {
      data.id = data.itemId;
    }
    return data;
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

  async getMapPins() {
    try {
      const response = await fetch(`${API_BASE_URL}/items/map/pins`);
      if (!response.ok) {
        // Return empty array instead of throwing - map will still work
        console.warn('Failed to fetch map pins:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      return data.pins || [];
    } catch (error) {
      console.error('Error fetching map pins:', error);
      return []; // Return empty array on error
    }
  }
}

export const apiService = new ApiService();
