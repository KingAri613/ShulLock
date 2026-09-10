import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Config } from '../constants/config';

const ACTIVE_NOTIFICATION_ID = 'shul-lock-active';

/**
 * Set up the notification channel and handler.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(Config.NOTIFICATION_CHANNEL_ID, {
      name: 'Shul Lock Active',
      description: 'Shows when Shul Lock is keeping your phone silent',
      importance: Notifications.AndroidImportance.LOW,
      sound: undefined,
      vibrationPattern: [0],
      lightColor: '#1A237E',
    });
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowInForeground: false,
    }),
  });
}

/**
 * Request notification permissions.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if notification permission is granted.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Show a persistent notification while Shul Lock is active.
 */
export async function showActiveNotification(shulName?: string): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: ACTIVE_NOTIFICATION_ID,
    content: {
      title: 'Shul Lock is Active',
      body: shulName
        ? `Your phone is in silent mode at ${shulName}`
        : 'Your phone is in silent mode',
      sticky: true,
      priority: Notifications.AndroidNotificationPriority.LOW,
      ...(Platform.OS === 'android' && {
        channelId: Config.NOTIFICATION_CHANNEL_ID,
      }),
    },
    trigger: null, // Show immediately
  });
}

/**
 * Dismiss the active notification.
 */
export async function dismissActiveNotification(): Promise<void> {
  await Notifications.dismissNotificationAsync(ACTIVE_NOTIFICATION_ID);
}
