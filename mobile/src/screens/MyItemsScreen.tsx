import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Item, Screen } from '../types';
import { apiService } from '../services/api';
import EditItemScreen from './EditItemScreen';

const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

interface MyItemsScreenProps {
  onNavigate?: (screen: Screen) => void;
}

export default function MyItemsScreen({ onNavigate }: MyItemsScreenProps = {} as MyItemsScreenProps) {
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadMyItems = async () => {
    try {
      const response = await apiService.getAllItems();
      // Filter by current user
      const userItems = (response.items || []).filter((item: Item) => 
        item.userId === DEFAULT_USER_ID
      );
      setMyItems(userItems);
    } catch (error) {
      console.error('Failed to load items:', error);
      Alert.alert('Error', 'Failed to load items');
    }
  };

  useEffect(() => {
    loadMyItems();
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const success = await apiService.deleteItem(itemId);
            if (success) {
              // Remove from local state immediately
              setMyItems(prevItems => prevItems.filter(item => item.id !== itemId));
              // Also refresh from server to ensure consistency
              loadMyItems();
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete item');
          }
        }
      }
    ]);
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
  };

  const handleItemUpdated = () => {
    loadMyItems();
    setEditingItem(null);
  };

  const handleNavigate = (screen: Screen) => {
    if (onNavigate) {
      onNavigate(screen);
    } else {
      // Fallback if no navigation prop provided
      setEditingItem(null);
    }
  };

  // Show edit screen if editing
  if (editingItem) {
    return (
      <EditItemScreen
        item={editingItem}
        onNavigate={handleNavigate}
        onItemUpdated={handleItemUpdated}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Items</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {myItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No items yet</Text>
            </View>
          ) : (
            myItems.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.badge, item.status === 'LOST' ? styles.lostBadge : styles.foundBadge]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                  </View>
                </View>
                <Text style={styles.description}>{item.description}</Text>
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditItem(item)}
                  >
                    <Ionicons name="pencil" size={10} color="#003071" />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDeleteItem(item.id)}
                  >
                    <Ionicons name="trash" size={10} color="#dc2626" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#003071',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lostBadge: {
    backgroundColor: '#fee2e2',
  },
  foundBadge: {
    backgroundColor: '#d1fae5',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e7ff',
    padding:10,
    borderRadius: 6,
    gap: 6,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#003071',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fee2e2',
    padding: 10,
    borderRadius: 6,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#dc2626',
  },
});

