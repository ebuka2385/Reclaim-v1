import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons 
          name={currentScreen === 'home' ? 'home' : 'home-outline'} 
          size={24} 
          color={currentScreen === 'home' ? '#fff' : '#b8c5d6'} 
          style={styles.icon}
        />
        <Text style={[styles.label, currentScreen === 'home' && styles.activeLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('search')}
      >
        <Ionicons 
          name={currentScreen === 'search' || currentScreen === 'map' ? 'map' : 'map-outline'} 
          size={24} 
          color={currentScreen === 'search' || currentScreen === 'map' ? '#fff' : '#b8c5d6'} 
          style={styles.icon}
        />
        <Text style={[styles.label, (currentScreen === 'search' || currentScreen === 'map') && styles.activeLabel]}>
          Search
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('messages')}
      >
        <Ionicons 
          name={currentScreen === 'messages' || currentScreen === 'chat' ? 'chatbubbles' : 'chatbubbles-outline'} 
          size={24} 
          color={currentScreen === 'messages' || currentScreen === 'chat' ? '#fff' : '#b8c5d6'} 
          style={styles.icon}
        />
        <Text style={[styles.label, (currentScreen === 'messages' || currentScreen === 'chat') && styles.activeLabel]}>
          Messages
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.tab}
        onPress={() => onNavigate('notifications')}
      >
        <Ionicons 
          name={currentScreen === 'notifications' ? 'notifications' : 'notifications-outline'} 
          size={24} 
          color={currentScreen === 'notifications' ? '#fff' : '#b8c5d6'} 
          style={styles.icon}
        />
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

