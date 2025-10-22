import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Screen } from '../../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export default function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('home')}
      >
        <Text style={styles.icon}>🏠</Text>
        <Text style={[styles.label, currentScreen === 'home' && styles.activeLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('report')}
      >
        <Text style={styles.icon}>➕</Text>
        <Text style={[styles.label, currentScreen === 'report' && styles.activeLabel]}>
          Report
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('items')}
      >
        <Text style={styles.icon}>📋</Text>
        <Text style={[styles.label, currentScreen === 'items' && styles.activeLabel]}>
          Items
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    paddingBottom: 25,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
  },
  activeLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

