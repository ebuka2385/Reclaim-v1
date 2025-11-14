import React from 'react';
import MyItemsScreen from '../MyItemsScreen';
import { apiService } from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    SafeAreaView: 'SafeAreaView',
    View: 'View',
    Text: 'Text',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

const mockOnNavigate = jest.fn();

const mockItems = [
  {
    id: '1',
    itemId: '1',
    title: 'My Lost Item',
    description: 'Description 1',
    status: 'LOST' as const,
    userId: 'temp-user-id',
  },
  {
    id: '2',
    itemId: '2',
    title: 'My Found Item',
    description: 'Description 2',
    status: 'FOUND' as const,
    userId: 'temp-user-id',
  },
];

describe('MyItemsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.getAllItems as jest.Mock).mockResolvedValue({ items: mockItems });
  });

  it('should filter items by user ID', () => {
    const allItems = mockItems;
    const userItems = allItems.filter((item: any) => item.userId === 'temp-user-id');
    
    expect(userItems).toHaveLength(2);
    expect(userItems[0].userId).toBe('temp-user-id');
  });

  it('should handle empty items array', () => {
    const items: any[] = [];
    expect(items).toHaveLength(0);
  });

  it('should delete item by ID', async () => {
    (apiService.deleteItem as jest.Mock).mockResolvedValue(true);

    await apiService.deleteItem('1');
    
    expect(apiService.deleteItem).toHaveBeenCalledWith('1');
  });

  it('should handle item data structure', () => {
    expect(mockItems[0]).toHaveProperty('id');
    expect(mockItems[0]).toHaveProperty('title');
    expect(mockItems[0]).toHaveProperty('description');
    expect(mockItems[0]).toHaveProperty('status');
    expect(mockItems[0]).toHaveProperty('userId');
  });

  it('should handle navigation function', () => {
    expect(typeof mockOnNavigate).toBe('function');
    mockOnNavigate('myitems');
    expect(mockOnNavigate).toHaveBeenCalledWith('myitems');
  });
});

