const API_BASE_URL = 'http://172.20.71.2:3000';
const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

export interface CreateItemRequest {
  title: string;
  description: string;
  status: 'LOST' | 'FOUND';
}

class ApiService {
  async getAllItems() {
    const response = await fetch(`${API_BASE_URL}/items`);
    return response.json();
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

  async deleteItem(id: string) {
    const response = await fetch(`${API_BASE_URL}/items/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }
}

export const apiService = new ApiService();
