import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { Item } from '../types';
import { apiService } from '../services/api';

const DEFAULT_USER_ID = 'temp-user-id'; // Default user for demo

export default function MyItemsScreen() {
  const [myItems, setMyItems] = useState<Item[]>([]);

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
    }
  };

  useEffect(() => {
    loadMyItems();
  }, []);

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteItem(itemId);
            setMyItems(prevItems => prevItems.filter(item => item.id !== itemId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        }
      }
    ]);
  };

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
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteItem(item.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
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
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#dc2626',
  },
});

