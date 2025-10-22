import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Item } from '../types';

export default function ViewItemsScreen() {
  const items: Item[] = [
    { id: '1', title: 'Blue Backpack', description: 'Lost near library', status: 'LOST' },
    { id: '2', title: 'iPhone 15 Pro', description: 'Found in cafeteria', status: 'FOUND' },
    { id: '3', title: 'Student ID Card', description: 'Found near gym', status: 'FOUND' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>View Items</Text>
      </View>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View style={[styles.badge, item.status === 'LOST' ? styles.lostBadge : styles.foundBadge]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          ))}
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
    backgroundColor: '#3b82f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
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
  },
});

