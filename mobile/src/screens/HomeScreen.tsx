import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../types';
import { SignOutButton } from './components/SignOutButton';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <View style={styles.headerActions}>
          <SignOutButton compact />
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to Reclaim</Text>
        <Text style={styles.description}>Your campus lost & found platform</Text>
        
        <View style={styles.quickLinks}>
          <TouchableOpacity 
            style={styles.card}
            onPress={() => onNavigate('report')}
          >
            <Ionicons name="create-outline" size={32} color="#003071" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Report Item</Text>
            <Text style={styles.cardDesc}>Lost or found something?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => onNavigate('search')}
          >
            <Ionicons name="search-outline" size={32} color="#003071" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Search Items</Text>
            <Text style={styles.cardDesc}>Find what you're looking for</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.card}
            onPress={() => onNavigate('myitems')}
          >
            <Ionicons name="cube-outline" size={32} color="#003071" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>My Items</Text>
            <Text style={styles.cardDesc}>View your reports</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  quickLinks: {
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
  },
});

