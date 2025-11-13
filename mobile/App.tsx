import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  LoginScreen, 
  HomeScreen, 
  ReportItemScreen, 
  SearchScreen, 
  MapScreen, 
  NotificationsScreen, 
  MyItemsScreen 
} from './src/screens';
import BottomNav from './src/screens/components/BottomNav';
import { Screen } from './src/types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={setScreen} />;
      case 'report':
        return <ReportItemScreen onNavigate={setScreen} />;
      case 'search':
        return <SearchScreen />;
      case 'map':
        return <SearchScreen />; // Map merged into search
      case 'notifications':
        return <NotificationsScreen />;
      case 'myitems':
        return <MyItemsScreen onNavigate={setScreen} />;
      default:
        return <HomeScreen onNavigate={setScreen} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav currentScreen={screen} onNavigate={setScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

