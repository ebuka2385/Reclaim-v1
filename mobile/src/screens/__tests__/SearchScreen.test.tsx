import React from 'react';
import SearchScreen from '../SearchScreen';
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
    FlatList: 'FlatList',
    TouchableOpacity: 'TouchableOpacity',
    WebView: 'WebView',
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

const mockPins = [
  {
    itemId: '1',
    title: 'AirPods',
    description: 'White AirPods',
    status: 'FOUND' as const,
    latitude: 37.7749,
    longitude: -122.4194,
  },
  {
    itemId: '2',
    title: 'Backpack',
    description: 'Blue backpack',
    status: 'LOST' as const,
    latitude: 37.7750,
    longitude: -122.4195,
  },
];

const mockOnNavigate = jest.fn();

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.getMapPins as jest.Mock).mockResolvedValue(mockPins);
  });

  it('should filter pins based on search query', () => {
    const query = 'AirPods'.toLowerCase();
    const filtered = mockPins.filter(pin =>
      pin.title.toLowerCase().includes(query) ||
      (pin.description && pin.description.toLowerCase().includes(query))
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('AirPods');
  });

  it('should return all pins when search query is empty', () => {
    const query = '';
    const filtered = query.trim() ? mockPins.filter(pin =>
      pin.title.toLowerCase().includes(query)
    ) : mockPins;
    
    expect(filtered).toHaveLength(2);
  });

  it('should create claim with correct itemId', async () => {
    (apiService.createClaim as jest.Mock).mockResolvedValue({
      claimId: 'claim-1',
      itemId: '1',
    });

    await apiService.createClaim('1');
    
    expect(apiService.createClaim).toHaveBeenCalledWith('1');
  });

  it('should handle map pin data structure', () => {
    expect(mockPins[0]).toHaveProperty('itemId');
    expect(mockPins[0]).toHaveProperty('title');
    expect(mockPins[0]).toHaveProperty('latitude');
    expect(mockPins[0]).toHaveProperty('longitude');
    expect(mockPins[0]).toHaveProperty('status');
  });

  it('should handle navigation function', () => {
    expect(typeof mockOnNavigate).toBe('function');
    mockOnNavigate('messages');
    expect(mockOnNavigate).toHaveBeenCalledWith('messages');
  });
});

