import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { loadNotificationPrefs } from './notificationPrefs';

import api from './api';

/**
 * Configure notifications shown while the app
 * is currently in the foreground.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


const ANDROID_CHANNEL_ID = 'gabai-default';

export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  try {
    await Notifications.setNotificationChannelAsync(
      ANDROID_CHANNEL_ID,
      {
        name: 'GabAi Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      },
    );

    console.log('🔔 GabAi Android notification channel ready');
  } catch (error) {
    console.error(
      '❌ Failed to create notification channel:',
      error,
    );
  }
}


/**
 * Request notification permission.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    console.log(
      '🔔 Notification permission:',
      finalStatus,
    );

    return finalStatus === 'granted';
  } catch (error) {
    console.error(
      '❌ Notification permission error:',
      error,
    );

    return false;
  }
}

/**
 * Get the native Firebase Cloud Messaging token.
 *
 * This returns the native FCM device token,
 * not an Expo push token.
 */
export async function getDevicePushToken(): Promise<string | null> {
  try {
    if (Platform.OS !== 'android') {
      console.log(
        'ℹ️ Native FCM token flow is currently configured for Android.',
      );

      return null;
    }

    const tokenResponse =
      await Notifications.getDevicePushTokenAsync();

    const token = tokenResponse.data;

    if (!token || typeof token !== 'string') {
      console.error(
        '❌ FCM device token was empty or invalid.',
      );

      return null;
    }

    console.log(
      '🔥 FCM DEVICE TOKEN:',
      token,
    );

    return token;
  } catch (error) {
    console.error(
      '❌ Failed to get FCM device token:',
      error,
    );

    return null;
  }
}

/**
 * Register the FCM token with the GabAi backend.
 *
 * The JWT is automatically attached by api.ts.
 */

export async function registerPushToken(
  token: string,
): Promise<boolean> {
  try {
    console.log(
      '📡 Registering FCM token with GabAi backend...',
    );

    const response = await api.post(
      '/notifications/push-token',
      {
        token,
        platform: Platform.OS,
      },
      {
        timeout: 60000,
      },
    );

    console.log(
      '✅ FCM token registration response received.',
    );

    return response.data?.success === true;
  } catch (error: any) {
    console.error(
      '❌ Failed to register FCM token:',
      error?.response?.data ?? error?.message ?? error,
    );

    return false;
  }
}


/**
 * Initialize push notifications.
 *
 * Call this after the user is authenticated.
 */
export async function initializeNotifications(): Promise<{
  permissionGranted: boolean;
  deviceToken: string | null;
  registered: boolean;
}> {
  console.log(
    '🚀 Initializing GabAi notifications...',
  );

  // Respect the "Allow notifications" switch in Notification Settings.
  const prefs = await loadNotificationPrefs();

  if (!prefs.pushEnabled) {
    console.log(
      '🔕 Notifications are turned off in GabAi settings.',
    );

    return {
      permissionGranted: false,
      deviceToken: null,
      registered: false,
    };
  }

  await setupNotificationChannel();

  const permissionGranted =
    await requestNotificationPermission();

  if (!permissionGranted) {
    console.log(
      '⚠️ Notification permission was not granted.',
    );

    return {
      permissionGranted: false,
      deviceToken: null,
      registered: false,
    };
  }

  const deviceToken =
    await getDevicePushToken();

  if (!deviceToken) {
    return {
      permissionGranted: true,
      deviceToken: null,
      registered: false,
    };
  }

  const registered =
    await registerPushToken(deviceToken);

  return {
    permissionGranted: true,
    deviceToken,
    registered,
  };
}

/**
 * Listen for native FCM token changes.
 *
 * Firebase can rotate device tokens, so the new token
 * should also be sent to the backend.
 */
export function subscribeToTokenChanges() {
  const subscription =
    Notifications.addPushTokenListener(
      async (token) => {
        console.log(
          '🔄 FCM token changed:',
          token.data,
        );

        // Don't re-register while notifications are turned off.
        const prefs = await loadNotificationPrefs();

        if (!prefs.pushEnabled) {
          return;
        }

        if (typeof token.data === 'string') {
          await registerPushToken(token.data);
        }
      },
    );

  return subscription;
}

/**
 * Remove this phone's token from the backend so it stops
 * receiving pushes. Uses DELETE /notifications/push-token
 * with { token } in the body.
 */
export async function unregisterPushToken(): Promise<boolean> {
  try {
    const token = await getDevicePushToken();

    if (!token) {
      return false;
    }

    await api.delete('/notifications/push-token', {
      data: { token },
    });

    return true;
  } catch (error: any) {
    console.error(
      '❌ Failed to unregister push token:',
      error?.response?.data ?? error?.message ?? error,
    );

    return false;
  }
}
