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
        onPress={() => onNavigate('search')}
      >
        <Text style={styles.icon}>🔍</Text>
        <Text style={[styles.label, currentScreen === 'search' && styles.activeLabel]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('map')}
      >
        <Text style={styles.icon}>🗺️</Text>
        <Text style={[styles.label, currentScreen === 'map' && styles.activeLabel]}>
          Map
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('notifications')}
      >
        <Text style={styles.icon}>🔔</Text>
        <Text style={[styles.label, currentScreen === 'notifications' && styles.activeLabel]}>
          Alerts
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#003071',
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
    color: '#b8c5d6',
  },
  activeLabel: {
    color: '#fff',
    fontWeight: '600',
  },
});

