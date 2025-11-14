import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';
import { Screen } from '../types';

interface ChatScreenProps {
  threadId: string;
  claimId: string;
  onNavigate: (screen: Screen) => void;
}

interface Message {
  messageId: string;
  text: string;
  userId: string;
  createdAt: string;
}

interface Claim {
  claimId: string;
  itemId: string;
  claimerId: string;
  finderId: string;
  status: string;
  handedOff: boolean;
  item: {
    title: string;
    description: string;
  };
}

export default function ChatScreen({ threadId, claimId, onNavigate }: ChatScreenProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [claim, setClaim] = useState<Claim | null>(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const DEFAULT_USER_ID = 'temp-user-id';

  useEffect(() => {
    loadData();
    // Refresh messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [threadId, claimId]);

  const loadData = async () => {
    await Promise.all([loadClaim(), loadMessages()]);
  };

  const loadClaim = async () => {
    try {
      // Get claim from conversations or fetch directly
      const conversations = await apiService.getConversations();
      const foundClaim = conversations.find((conv: any) => conv.claim?.claimId === claimId)?.claim;
      if (foundClaim) {
        setClaim(foundClaim);
      } else {
        // Fallback: try to get claim directly (if endpoint exists)
        try {
          const claimData = await apiService.getClaim(claimId);
          setClaim(claimData);
        } catch {
          console.warn('Could not load claim details');
        }
      }
    } catch (error) {
      console.error('Failed to load claim:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await apiService.getMessages(threadId);
      setMessages(messagesData);
      setLoading(false);
      // Scroll to bottom after messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const text = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await apiService.sendMessage(threadId, text);
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send message');
      setMessageText(text); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      'Approve Claim',
      'Are you sure you want to approve this claim?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.approveClaim(claimId);
              await apiService.ensureThread(claimId);
              await loadClaim();
              await loadMessages();
              Alert.alert('Success', 'Claim approved! You can now chat.');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to approve claim');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDeny = async () => {
    Alert.alert(
      'Deny Claim',
      'Are you sure you want to deny this claim? This will archive the conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deny',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.denyClaim(claimId);
              Alert.alert('Claim Denied', 'The conversation has been archived.', [
                { text: 'OK', onPress: () => onNavigate('messages') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to deny claim');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleHandedOff = async () => {
    Alert.alert(
      'Mark as Handed Off',
      'Have you physically handed off the item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Handed Off',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.markHandedOff(claimId);
              await loadClaim();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to mark as handed off');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmReceipt = async () => {
    Alert.alert(
      'Confirm Receipt',
      'Have you received the item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Received',
          onPress: async () => {
            try {
              setActionLoading(true);
              await apiService.confirmReceipt(claimId);
              Alert.alert('Success', 'Item marked as found!', [
                { text: 'OK', onPress: () => onNavigate('messages') },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to confirm receipt');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const isFinder = claim?.finderId === DEFAULT_USER_ID;
  const isClaimer = claim?.claimerId === DEFAULT_USER_ID;
  const canChat = claim?.status === 'ACCEPTED' || claim?.status === 'APPROVED';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#003071" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('messages')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{claim?.item.title || 'Chat'}</Text>
          <Text style={styles.headerSubtitle}>
            {isFinder ? 'Claimer' : 'Finder'}
          </Text>
        </View>
      </View>

      {claim && (claim.status === 'OPEN' || claim.status === 'PENDING') && isFinder && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={handleApprove}
            disabled={actionLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.denyButton]}
            onPress={handleDeny}
            disabled={actionLoading}
          >
            <Ionicons name="close-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Deny</Text>
          </TouchableOpacity>
        </View>
      )}

      {claim && (claim.status === 'ACCEPTED' || claim.status === 'APPROVED') && claim.handedOff && isClaimer && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={handleConfirmReceipt}
            disabled={actionLoading}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Confirm Receipt</Text>
          </TouchableOpacity>
        </View>
      )}

      {claim && (claim.status === 'ACCEPTED' || claim.status === 'APPROVED') && !claim.handedOff && isFinder && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.handoffButton]}
            onPress={handleHandedOff}
            disabled={actionLoading}
          >
            <Ionicons name="hand-left" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Mark as Handed Off</Text>
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.messageId}
          renderItem={({ item }) => {
            const isMyMessage = item.userId === DEFAULT_USER_ID;
            return (
              <View style={[styles.messageContainer, isMyMessage ? styles.myMessage : styles.theirMessage]}>
                <Text style={[styles.messageText, isMyMessage && styles.myMessageText]}>
                  {item.text}
                </Text>
                <Text style={[styles.messageTime, isMyMessage && styles.myMessageTime]}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {canChat ? 'Start the conversation...' : 'Waiting for claim approval...'}
              </Text>
            </View>
          }
        />

        {canChat && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, (!messageText.trim() || sending) && styles.sendButtonDisabled]}
              onPress={sendMessage}
              disabled={!messageText.trim() || sending}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#003071',
  },
  backButton: {
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#b8c5d6',
    marginTop: 2,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  denyButton: {
    backgroundColor: '#ef4444',
  },
  handoffButton: {
    backgroundColor: '#f59e0b',
  },
  confirmButton: {
    backgroundColor: '#10b981',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#003071',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 16,
    color: '#111',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#666',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: '#b8c5d6',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#003071',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});

