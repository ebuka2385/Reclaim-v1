import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiService } from './api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  private static instance: NotificationService;
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Request permissions and register device token
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        return;
      }

      // Get the push token
      // Note: For Expo Go, you can omit projectId. For standalone builds, set it in app.json
      const tokenData = await Notifications.getExpoPushTokenAsync();

      const token = tokenData.data;
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      // Register token with backend
      await apiService.registerPushToken(token, platform);
    } catch (error) {
      // Silently fail
    }
  }

  /**
   * Set up notification listeners
   */
  setupListeners(
    onNotificationReceived: (notification: Notifications.Notification) => void,
    onNotificationTapped: (response: Notifications.NotificationResponse) => void
  ): () => void {
    // Listener for notifications received while app is foregrounded
    const receivedListener = Notifications.addNotificationReceivedListener(onNotificationReceived);

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationTapped);

    // Return cleanup function
    return () => {
      receivedListener.remove();
      responseListener.remove();
    };
  }
}

export const notificationService = NotificationService.getInstance();

