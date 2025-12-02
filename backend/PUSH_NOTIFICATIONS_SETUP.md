# Push Notifications Setup Guide

This guide explains how to set up Apple Push Notifications (APNs) for the Reclaim app using Expo's push notification service.

## Prerequisites

1. Expo account (free)
2. iOS device or simulator for testing
3. Backend database migration completed (DeviceToken model)

## Backend Setup

### 1. Database Migration Required

**IMPORTANT**: Before using push notifications, the `DeviceToken` model must be added to the Prisma schema.

**What needs to be added to `backend/prisma/schema.prisma`:**

```prisma
model DeviceToken {
  tokenId   String   @id @default(cuid())
  userId    String
  token     String   @unique
  platform  String   @default("ios") // "ios" or "android"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [userId], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

Also add to the `User` model:
```prisma
deviceTokens DeviceToken[]
```

**After adding the model:**
```bash
cd backend
npx prisma migrate dev --name add_device_token_model
npx prisma generate
```

### 2. Backend is Ready

The backend implementation is complete:
- ✅ `notification.service.ts` - Handles push notification sending
- ✅ `notification.controller.ts` - API endpoints
- ✅ `notification.routes.ts` - Routes registered
- ✅ `expo-server-sdk` package installed

## API Endpoints

### POST /notifications/register
Registers a device push token for a user.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "token": "ExponentPushToken[...]",
  "platform": "ios" // optional, defaults to "ios"
}
```

**Response (201 Created):**
```json
{
  "message": "Device token registered successfully",
  "deviceToken": { ... }
}
```

### POST /notifications/test/:userId
Sends a test push notification to a user (for testing).

**Response (200 OK):**
```json
{
  "message": "Test notification sent successfully",
  "tickets": ["ticket-id-1", "ticket-id-2"],
  "count": 2
}
```

### POST /notifications/send
Sends a custom push notification.

**Request Body:**
```json
{
  "userId": "user_id_here",
  "title": "Notification Title",
  "body": "Notification message",
  "data": { "custom": "data" } // optional
}
```

### DELETE /notifications/token/:token
Removes a device token (e.g., on logout).

## Frontend Setup (Mobile App)

### 1. Install Expo Notifications

```bash
cd mobile
npx expo install expo-notifications
```

### 2. Request Permissions

Add to your app initialization (e.g., `App.tsx`):

```typescript
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request permissions and get token
async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    alert('Failed to get push token for push notification!');
    return;
  }
  
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);
  
  // Send token to backend
  // POST /notifications/register with { userId, token, platform: "ios" }
  
  return token;
}
```

### 3. Register Token with Backend

After getting the Expo push token, send it to your backend:

```typescript
async function registerPushToken(userId: string, token: string) {
  await fetch(`${API_BASE_URL}/notifications/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    }),
  });
}
```

### 4. Test Notification

To test if notifications work, call:

```typescript
// POST /notifications/test/:userId
await fetch(`${API_BASE_URL}/notifications/test/${userId}`, {
  method: 'POST',
});
```

## How It Works

1. **Frontend**: User grants notification permissions
2. **Frontend**: Gets Expo push token using `expo-notifications`
3. **Frontend**: Sends token to backend via `POST /notifications/register`
4. **Backend**: Stores token in database (DeviceToken model)
5. **Backend**: When notification needed, calls `sendPushNotification()`
6. **Backend**: Sends notification via Expo's push service
7. **Device**: Receives and displays notification

## Testing

### Test Flow:
1. Complete database migration (add DeviceToken model)
2. Start backend server
3. In mobile app, request permissions and get token
4. Register token with backend
5. Call `POST /notifications/test/:userId` endpoint
6. Check device for test notification

### Expected Result:
- Device receives push notification with title "Test Notification"
- Message: "This is a test notification from Reclaim! 🎉"
- Notification appears even when app is in background

## Troubleshooting

### "User has no registered device tokens"
- Make sure token was registered via `/notifications/register`
- Check that userId matches the registered token's userId

### "Invalid Expo push token format"
- Token should start with `ExponentPushToken[` or `ExponentsPushToken[`
- Make sure you're using the token from `getExpoPushTokenAsync()`

### Notifications not appearing
- Check device notification permissions
- Verify token was registered successfully
- Check backend logs for Expo API errors
- Ensure app is built with EAS Build (not Expo Go) for production

## Next Steps

After testing works:
1. Integrate notifications into actual features:
   - Claim creation notifications
   - Claim approval/denial notifications
   - New message notifications
   - Match notifications (when Lost/Found items match)
2. Add notification preferences (user can opt out)
3. Add notification history/in-app notifications

