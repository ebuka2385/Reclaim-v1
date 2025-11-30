import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { 
  LoginScreen, 
  HomeScreen, 
  ReportItemScreen, 
  SearchScreen, 
  MapScreen, 
  NotificationsScreen, 
  MyItemsScreen,
  MessagesScreen,
  ChatScreen
} from './src/screens';
import BottomNav from './src/screens/components/BottomNav';
import { Screen } from './src/types';
import { notificationService } from './src/services/notifications';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [screenParams, setScreenParams] = useState<any>({});

  const navigate = (newScreen: Screen, params?: any) => {
    setScreen(newScreen);
    setScreenParams(params || {});
  };

  // Initialize notifications when user logs in
  useEffect(() => {
    if (isLoggedIn) {
      // Register push token
      notificationService.initialize();

      // Set up notification listeners
      const cleanup = notificationService.setupListeners(
        () => {
          // Notification received in foreground - handled by Expo's notification handler
        },
        (response) => {
          const data = response.notification.request.content.data;
          
          if (data?.type === 'claim_created' || data?.type === 'claim_approved' || data?.type === 'item_created') {
            if (data.claimId) {
              navigate('messages');
            } else {
              navigate('notifications');
            }
          }
        }
      );

      return cleanup;
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen onNavigate={navigate} />;
      case 'report':
        return <ReportItemScreen onNavigate={navigate} />;
      case 'search':
        return <SearchScreen onNavigate={navigate} />;
      case 'map':
        return <SearchScreen onNavigate={navigate} />; // Map merged into search
      case 'notifications':
        return <NotificationsScreen />;
      case 'myitems':
        return <MyItemsScreen onNavigate={navigate} />;
      case 'messages':
        return <MessagesScreen onNavigate={navigate} />;
      case 'chat':
        return <ChatScreen threadId={screenParams.threadId} claimId={screenParams.claimId} onNavigate={navigate} />;
      default:
        return <HomeScreen onNavigate={navigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <BottomNav currentScreen={screen} onNavigate={navigate} />
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

