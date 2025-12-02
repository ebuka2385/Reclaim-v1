import { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
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
import { apiService } from './src/services/api';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || '';

if (!publishableKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable');
}

function AppContent() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [screen, setScreen] = useState<Screen>('home');
  const [screenParams, setScreenParams] = useState<any>({});
  const [isSyncing, setIsSyncing] = useState(false);

  const navigate = (newScreen: Screen, params?: any) => {
    setScreen(newScreen);
    setScreenParams(params || {});
  };

  // Sync user to database when they sign in
  useEffect(() => {
    if (isSignedIn && isLoaded && user && !isSyncing) {
      const syncUser = async () => {
        try {
          setIsSyncing(true);
          const email = user.emailAddresses[0]?.emailAddress;
          const name = user.fullName || user.firstName || email?.split('@')[0] || 'User';
          
          if (!email) {
            return;
          }
          
          await apiService.syncUser(email, name);
        } catch (error) {
          // Silently fail - don't block the app if sync fails
        } finally {
          setIsSyncing(false);
        }
      };
      
      syncUser();
    }
  }, [isSignedIn, isLoaded, user]);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (isSignedIn && isLoaded && !isSyncing) {
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
  }, [isSignedIn, isLoaded, isSyncing]);

  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  if (!isSignedIn) {
    return <LoginScreen />;
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

export default function App() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppContent />
    </ClerkProvider>
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

