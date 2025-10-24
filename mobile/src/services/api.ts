const API_BASE_URL = 'http://172.20.150.181:3000';

console.log('🌐 API Service initialized with base URL:', API_BASE_URL);

export interface CreateItemRequest {
  title: string;
  description: string;
  status: 'LOST' | 'FOUND';
  userId: string;
}

class ApiService {
  async getAllItems() {
    const response = await fetch(`${API_BASE_URL}/items`);
    return response.json();
  }

  async createItem(itemData: CreateItemRequest) {
    console.log('➕ API: Creating item:', itemData);
    try {
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API: createItem failed:', error);
      throw error;
    }
  }

  async updateItemStatus(id: string, status: 'LOST' | 'FOUND' | 'CLAIMED') {
    console.log('🔄 API: Updating item status:', { id, status });
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ API: updateItemStatus failed:', error);
      throw error;
    }
  }

  async deleteItem(id: string) {
    console.log('🗑️ API: Deleting item:', id);
    try {
      const response = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
      });
      const success = response.ok;
      return success;
    } catch (error) {
      console.error('❌ API: deleteItem failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
