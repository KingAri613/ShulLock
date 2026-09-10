import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Shul, ShulLockState, AppSettings } from '../types/Shul';
import * as Storage from './storage';
import * as GeofenceService from '../services/geofence';
import * as NotificationService from '../services/notifications';

interface ShulLockContextType {
  // Lock state
  lockState: ShulLockState;
  activateLock: (shulName?: string | null, shulId?: string | null) => Promise<void>;
  deactivateLock: () => Promise<void>;

  // Shuls
  shuls: Shul[];
  loadShuls: () => Promise<void>;
  addShul: (shul: Shul) => Promise<void>;
  updateShul: (shul: Shul) => Promise<void>;
  deleteShul: (id: string) => Promise<void>;
  toggleShulEnabled: (id: string) => Promise<void>;

  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
}

const ShulLockContext = createContext<ShulLockContextType | undefined>(undefined);

export function ShulLockProvider({ children }: { children: ReactNode }) {
  const [lockState, setLockState] = useState<ShulLockState>({
    isActive: false,
    activeShulName: null,
    activeShulId: null,
  });

  const [shuls, setShuls] = useState<Shul[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    autoActivate: true,
    autoDeactivate: true,
    startupMode: false,
  });

  const loadShuls = useCallback(async () => {
    const loaded = await Storage.getShuls();
    setShuls(loaded);
  }, []);

  const loadSettings = useCallback(async () => {
    const loaded = await Storage.getSettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    loadShuls();
    loadSettings();
    NotificationService.setupNotificationChannel();
  }, [loadShuls, loadSettings]);

  const activateLock = useCallback(async (shulName?: string | null, shulId?: string | null) => {
    setLockState({
      isActive: true,
      activeShulName: shulName ?? null,
      activeShulId: shulId ?? null,
    });
    await NotificationService.showActiveNotification(shulName ?? undefined);
  }, []);

  const deactivateLock = useCallback(async () => {
    setLockState({
      isActive: false,
      activeShulName: null,
      activeShulId: null,
    });
    await NotificationService.dismissActiveNotification();
  }, []);

  const addShulHandler = useCallback(async (shul: Shul) => {
    await Storage.addShul(shul);
    await loadShuls();
    if (shul.isEnabled) {
      await GeofenceService.registerGeofences(await Storage.getEnabledShuls());
    }
  }, [loadShuls]);

  const updateShulHandler = useCallback(async (shul: Shul) => {
    await Storage.updateShul(shul);
    await loadShuls();
    await GeofenceService.registerGeofences(await Storage.getEnabledShuls());
  }, [loadShuls]);

  const deleteShulHandler = useCallback(async (id: string) => {
    await Storage.deleteShul(id);
    await loadShuls();
    await GeofenceService.registerGeofences(await Storage.getEnabledShuls());
  }, [loadShuls]);

  const toggleShulEnabled = useCallback(async (id: string) => {
    const shul = shuls.find((s) => s.id === id);
    if (!shul) return;
    const updated = { ...shul, isEnabled: !shul.isEnabled };
    await Storage.updateShul(updated);
    await loadShuls();
    await GeofenceService.registerGeofences(await Storage.getEnabledShuls());
  }, [shuls, loadShuls]);

  const updateSettingsHandler = useCallback(async (partial: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    await Storage.saveSettings(newSettings);
  }, [settings]);

  return (
    <ShulLockContext.Provider
      value={{
        lockState,
        activateLock,
        deactivateLock,
        shuls,
        loadShuls,
        addShul: addShulHandler,
        updateShul: updateShulHandler,
        deleteShul: deleteShulHandler,
        toggleShulEnabled,
        settings,
        updateSettings: updateSettingsHandler,
        loadSettings,
      }}
    >
      {children}
    </ShulLockContext.Provider>
  );
}

export function useShulLock() {
  const context = useContext(ShulLockContext);
  if (!context) {
    throw new Error('useShulLock must be used within a ShulLockProvider');
  }
  return context;
}
