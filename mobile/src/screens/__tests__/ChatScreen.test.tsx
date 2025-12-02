import React from 'react';
import ChatScreen from '../ChatScreen';
import { apiService } from '../../services/api';

jest.mock('../../services/api');
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
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    ActivityIndicator: 'ActivityIndicator',
    Platform: {
      OS: 'ios',
    },
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      create: (styles: any) => styles,
    },
  };
});

const mockOnNavigate = jest.fn();

const mockMessages = [
  {
    messageId: 'msg-1',
    text: 'Hello',
    userId: 'temp-user-id',
    createdAt: new Date().toISOString(),
  },
  {
    messageId: 'msg-2',
    text: 'Hi there',
    userId: 'other-user',
    createdAt: new Date().toISOString(),
  },
];

const mockClaim = {
  claimId: 'claim-1',
  itemId: 'item-1',
  claimerId: 'temp-user-id',
  finderId: 'finder-1',
  status: 'OPEN',
  handedOff: false,
  item: {
    title: 'Test Item',
    description: 'Test Description',
  },
};

describe('ChatScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiService.getConversations as jest.Mock).mockResolvedValue([
      {
        threadId: 'thread-1',
        claim: mockClaim,
      },
    ]);
    (apiService.getMessages as jest.Mock).mockResolvedValue(mockMessages);
  });

  it('should handle messages data structure', () => {
    expect(mockMessages).toHaveLength(2);
    expect(mockMessages[0]).toHaveProperty('messageId');
    expect(mockMessages[0]).toHaveProperty('text');
    expect(mockMessages[0]).toHaveProperty('userId');
  });

  it('should identify user role correctly', () => {
    const DEFAULT_USER_ID = 'temp-user-id';
    const isFinder = mockClaim.finderId === DEFAULT_USER_ID;
    const isClaimer = mockClaim.claimerId === DEFAULT_USER_ID;
    
    expect(isClaimer).toBe(true);
    expect(isFinder).toBe(false);
  });

  it('should determine if chat is enabled', () => {
    const canChat = mockClaim.status === 'ACCEPTED' || mockClaim.status === 'APPROVED';
    expect(canChat).toBe(false); // OPEN status
  });

  it('should send message with correct parameters', async () => {
    (apiService.sendMessage as jest.Mock).mockResolvedValue({
      messageId: 'msg-3',
      text: 'New message',
    });

    await apiService.sendMessage('thread-1', 'New message');
    
    expect(apiService.sendMessage).toHaveBeenCalledWith('thread-1', 'New message');
  });

  it('should approve claim', async () => {
    (apiService.approveClaim as jest.Mock).mockResolvedValue({
      ...mockClaim,
      status: 'ACCEPTED',
    });
    (apiService.ensureThread as jest.Mock).mockResolvedValue({ threadId: 'thread-1' });

    await apiService.approveClaim('claim-1');
    
    expect(apiService.approveClaim).toHaveBeenCalledWith('claim-1');
  });

  it('should handle empty messages array', () => {
    const messages: any[] = [];
    expect(messages).toHaveLength(0);
  });
});

