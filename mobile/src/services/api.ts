const API_BASE_URL = 'http://172.20.152.210:3000';
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

    console.log('📤 Creating item with location:', {
      hasLocation: !!(itemData.latitude && itemData.longitude),
      lat: itemData.latitude,
      lng: itemData.longitude,
    });

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
    console.log('✅ Item created:', {
      id: data.itemId || data.id,
      hasLocation: !!(data.latitude && data.longitude),
    });
    
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
        console.warn('Failed to fetch map pins:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      const pins = data.pins || [];
      console.log(`✅ Loaded ${pins.length} map pins`);
      return pins;
    } catch (error: any) {
      console.error('❌ Error fetching map pins:', error.message || error);
      return [];
    }
  }

  // Claims API
  async createClaim(itemId: string) {
    const response = await fetch(`${API_BASE_URL}/claims`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId,
        ownerId: DEFAULT_USER_ID,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create claim' }));
      throw new Error(error.error || 'Failed to create claim');
    }
    return response.json();
  }

  async approveClaim(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/approve`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finderId: DEFAULT_USER_ID }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to approve claim' }));
      throw new Error(error.error || 'Failed to approve claim');
    }
    return response.json();
  }

  async denyClaim(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/deny`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finderId: DEFAULT_USER_ID }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to deny claim' }));
      throw new Error(error.error || 'Failed to deny claim');
    }
    return response.json();
  }

  async markHandedOff(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/handoff`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ finderId: DEFAULT_USER_ID }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to mark as handed off' }));
      throw new Error(error.error || 'Failed to mark as handed off');
    }
    return response.json();
  }

  async confirmReceipt(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}/confirm`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimerId: DEFAULT_USER_ID }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to confirm receipt' }));
      throw new Error(error.error || 'Failed to confirm receipt');
    }
    return response.json();
  }

  async getClaim(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/claims/${claimId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch claim');
    }
    return response.json();
  }

  // Messages API
  async getConversations() {
    const response = await fetch(`${API_BASE_URL}/messages/user/${DEFAULT_USER_ID}`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  }

  async getMessages(threadId: string) {
    const response = await fetch(`${API_BASE_URL}/messages/threads/${threadId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }
    const data = await response.json();
    return data.messages || [];
  }

  async sendMessage(threadId: string, text: string) {
    const response = await fetch(`${API_BASE_URL}/messages/threads/${threadId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: DEFAULT_USER_ID,
        text,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to send message' }));
      throw new Error(error.error || 'Failed to send message');
    }
    return response.json();
  }

  async ensureThread(claimId: string) {
    const response = await fetch(`${API_BASE_URL}/messages/threads/claim/${claimId}`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to create thread');
    }
    return response.json();
  }
}

export const apiService = new ApiService();
