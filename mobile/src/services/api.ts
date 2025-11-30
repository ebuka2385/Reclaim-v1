const API_BASE_URL = 'http://172.20.10.4:3000';
const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

// Store current userId
let currentUserId: string | null = null;

export const setUserId = (userId: string) => {
  currentUserId = userId;
};

export const getUserId = (): string => {
  return currentUserId || DEFAULT_USER_ID;
};

export const clearUserId = () => {
  currentUserId = null;
};

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
      userId: getUserId(),
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
        return [];
      }
      const data = await response.json();
      return data.pins || [];
    } catch (error: any) {
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
        ownerId: getUserId(),
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
      body: JSON.stringify({ finderId: getUserId() }),
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
      body: JSON.stringify({ finderId: getUserId() }),
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
      body: JSON.stringify({ finderId: getUserId() }),
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
      body: JSON.stringify({ claimerId: getUserId() }),
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
    const response = await fetch(`${API_BASE_URL}/messages/user/${getUserId()}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.conversations || [];
  }

  async getMessages(threadId: string) {
    const response = await fetch(`${API_BASE_URL}/messages/threads/${threadId}?userId=${getUserId()}`);
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
        userId: getUserId(),
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

  // Notifications API
  async registerPushToken(token: string, platform: string = 'ios') {
    const response = await fetch(`${API_BASE_URL}/notifications/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: getUserId(),
        token,
        platform,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to register token' }));
      throw new Error(error.error || 'Failed to register token');
    }
    return response.json();
  }

  async getNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${getUserId()}`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return data.notifications || [];
  }

  async markNotificationAsRead(notifId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notifId}/read`, {
      method: 'PATCH',
    });
    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }
    return response.json();
  }

  // Auth API - Sync Clerk user to database
  async syncUser(email: string, name: string) {
    if (!API_BASE_URL) {
      throw new Error('API_BASE_URL is not configured');
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || `Failed to sync user: HTTP ${response.status}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.userId) {
        throw new Error('Server response missing userId');
      }
      
      setUserId(data.userId);
      return data;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Cannot reach server at ${API_BASE_URL}`);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to sync user');
    }
  }
}

export const apiService = new ApiService();
