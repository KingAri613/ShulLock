import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shul, AppSettings } from '../types/Shul';

const SHULS_KEY = '@shullock/shuls';
const SETTINGS_KEY = '@shullock/settings';
const RINGER_STATE_KEY = '@shullock/ringer_state';

const defaultSettings: AppSettings = {
  autoActivate: true,
  autoDeactivate: true,
  startupMode: false,
};

// ── Shuls ──

export async function getShuls(): Promise<Shul[]> {
  try {
    const data = await AsyncStorage.getItem(SHULS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveShuls(shuls: Shul[]): Promise<void> {
  await AsyncStorage.setItem(SHULS_KEY, JSON.stringify(shuls));
}

export async function addShul(shul: Shul): Promise<void> {
  const shuls = await getShuls();
  shuls.push(shul);
  await saveShuls(shuls);
}

export async function updateShul(updated: Shul): Promise<void> {
  const shuls = await getShuls();
  const index = shuls.findIndex((s) => s.id === updated.id);
  if (index !== -1) {
    shuls[index] = updated;
    await saveShuls(shuls);
  }
}

export async function deleteShul(id: string): Promise<void> {
  const shuls = await getShuls();
  await saveShuls(shuls.filter((s) => s.id !== id));
}

export async function getEnabledShuls(): Promise<Shul[]> {
  const shuls = await getShuls();
  return shuls.filter((s) => s.isEnabled);
}

// ── Settings ──

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// ── Ringer state (for restoring after deactivation) ──

export async function saveRingerState(mode: number): Promise<void> {
  await AsyncStorage.setItem(RINGER_STATE_KEY, mode.toString());
}

export async function getRingerState(): Promise<number | null> {
  try {
    const data = await AsyncStorage.getItem(RINGER_STATE_KEY);
    return data ? parseInt(data, 10) : null;
  } catch {
    return null;
  }
}
