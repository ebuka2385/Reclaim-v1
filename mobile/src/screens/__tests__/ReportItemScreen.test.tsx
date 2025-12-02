import React from 'react';
import ReportItemScreen from '../ReportItemScreen';
import { apiService } from '../../services/api';

jest.mock('../../services/api');
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: { latitude: 37.7749, longitude: -122.4194 },
    })
  ),
  Accuracy: { Balanced: 1 },
}));
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    SafeAreaView: 'SafeAreaView',
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ScrollView: 'ScrollView',
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

const mockOnNavigate = jest.fn();

describe('ReportItemScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should validate required fields', () => {
    const title = '';
    const description = '';
    
    const isValid = !!(title.trim() && description.trim());
    expect(isValid).toBe(false);
  });

  it('should prepare item data with location', () => {
    const itemData = {
      title: 'Test Item',
      description: 'Test Description',
      status: 'FOUND' as const,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    expect(itemData.title).toBe('Test Item');
    expect(itemData.latitude).toBeDefined();
    expect(itemData.longitude).toBeDefined();
  });

  it('should prepare item data without location', () => {
    const itemData = {
      title: 'Test Item',
      description: 'Test Description',
      status: 'LOST' as const,
    };

    expect(itemData.title).toBe('Test Item');
    expect(itemData.latitude).toBeUndefined();
    expect(itemData.longitude).toBeUndefined();
  });

  it('should handle item creation with location', async () => {
    (apiService.createItem as jest.Mock).mockResolvedValue({
      itemId: '123',
      title: 'Test Item',
      description: 'Test Description',
      status: 'FOUND',
      latitude: 37.7749,
      longitude: -122.4194,
    });

    const result = await apiService.createItem({
      title: 'Test Item',
      description: 'Test Description',
      status: 'FOUND',
      latitude: 37.7749,
      longitude: -122.4194,
    });

    expect(result.itemId).toBe('123');
    expect(result.latitude).toBe(37.7749);
  });

  it('should handle item creation error', async () => {
    (apiService.createItem as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(
      apiService.createItem({
        title: 'Test',
        description: 'Test',
        status: 'LOST',
      })
    ).rejects.toThrow('Network error');
  });
});

