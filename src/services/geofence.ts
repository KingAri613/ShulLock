import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { Config } from '../constants/config';
import { Shul } from '../types/Shul';
import { getSettings, getShuls } from '../store/storage';

const TASK_NAME = Config.GEOFENCE_TASK_NAME;

/**
 * Define the background geofence task.
 * This runs when the device enters or exits a geofenced region.
 */
TaskManager.defineTask(TASK_NAME, async ({ data, error }: any) => {
  if (error) {
    console.error('Geofence task error:', error);
    return;
  }

  if (data) {
    const { eventType, region } = data;
    const settings = await getSettings();
    const shuls = await getShuls();
    const shul = shuls.find((s) => s.id === region?.identifier);

    if (eventType === Location.GeofencingEventType.Enter) {
      if (!settings.autoActivate) return;
      console.log('Entered geofence:', region?.identifier, shul?.name);
      // The notification and state activation will be handled by the app
      // when it processes the geofence event
    } else if (eventType === Location.GeofencingEventType.Exit) {
      if (!settings.autoDeactivate) return;
      console.log('Exited geofence:', region?.identifier, shul?.name);
    }
  }
});

/**
 * Request location permissions including background location.
 */
export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.warn('Background location permission not granted. Geofencing may not work when app is closed.');
  }

  return true;
}

/**
 * Check if location permissions are granted.
 */
export async function hasLocationPermission(): Promise<boolean> {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Check if background location permission is granted.
 */
export async function hasBackgroundLocationPermission(): Promise<boolean> {
  const { status } = await Location.getBackgroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Register geofences for a list of shuls.
 * Removes any existing geofences first, then registers new ones.
 */
export async function registerGeofences(shuls: Shul[]): Promise<void> {
  try {
    // Check if geofencing task is already registered, stop it first
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await Location.stopGeofencingAsync(TASK_NAME);
    }

    if (shuls.length === 0) return;

    const hasPermission = await hasLocationPermission();
    if (!hasPermission) {
      console.warn('Location permission not granted, cannot register geofences');
      return;
    }

    const regions: Location.LocationRegion[] = shuls.map((shul) => ({
      identifier: shul.id,
      latitude: shul.latitude,
      longitude: shul.longitude,
      radius: shul.radiusMeters,
      notifyOnEnter: true,
      notifyOnExit: true,
    }));

    await Location.startGeofencingAsync(TASK_NAME, regions);
    console.log(`Registered ${regions.length} geofences`);
  } catch (error) {
    console.error('Failed to register geofences:', error);
  }
}

/**
 * Remove all registered geofences.
 */
export async function removeAllGeofences(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
    if (isRegistered) {
      await Location.stopGeofencingAsync(TASK_NAME);
    }
  } catch (error) {
    console.error('Failed to remove geofences:', error);
  }
}
