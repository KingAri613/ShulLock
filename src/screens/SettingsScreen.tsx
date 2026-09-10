import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as IntentLauncher from 'expo-intent-launcher';
import { useShulLock } from '../store/ShulLockContext';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import * as GeofenceService from '../services/geofence';
import * as NotificationService from '../services/notifications';

interface PermissionStatus {
  location: boolean;
  backgroundLocation: boolean;
  notifications: boolean;
}

export default function SettingsScreen() {
  const { settings, updateSettings } = useShulLock();
  const [permissions, setPermissions] = useState<PermissionStatus>({
    location: false,
    backgroundLocation: false,
    notifications: false,
  });

  const refreshPermissions = useCallback(async () => {
    const [loc, bgLoc, notif] = await Promise.all([
      GeofenceService.hasLocationPermission(),
      GeofenceService.hasBackgroundLocationPermission(),
      NotificationService.hasNotificationPermission(),
    ]);
    setPermissions({
      location: loc,
      backgroundLocation: bgLoc,
      notifications: notif,
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshPermissions();
    }, [refreshPermissions])
  );

  const requestLocation = async () => {
    await GeofenceService.requestLocationPermissions();
    refreshPermissions();
  };

  const requestNotifications = async () => {
    await NotificationService.requestNotificationPermissions();
    refreshPermissions();
  };

  const openAppSettings = () => {
    if (Platform.OS === 'android') {
      IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
        { data: 'package:com.shullock.app' }
      ).catch(() => {
        IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.NOTIFICATION_POLICY_ACCESS_SETTINGS
        );
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Behaviour section */}
      <Text style={styles.sectionTitle}>Behaviour</Text>

      <SettingSwitch
        title="Automatic activation"
        description="Activate Shul Lock when entering a shul area"
        value={settings.autoActivate}
        onValueChange={(v) => updateSettings({ autoActivate: v })}
      />

      <SettingSwitch
        title="Automatic deactivation"
        description="Turn off Shul Lock when leaving the shul area"
        value={settings.autoDeactivate}
        onValueChange={(v) => updateSettings({ autoDeactivate: v })}
      />

      <SettingSwitch
        title="Startup mode"
        description="Show Shul Lock screen when the app opens"
        value={settings.startupMode}
        onValueChange={(v) => updateSettings({ startupMode: v })}
      />

      <View style={styles.divider} />

      {/* Permissions section */}
      <Text style={styles.sectionTitle}>Permissions</Text>

      <PermissionItem
        title="Location Permission"
        isGranted={permissions.location}
        onPress={requestLocation}
      />

      <PermissionItem
        title="Background Location"
        isGranted={permissions.backgroundLocation}
        onPress={requestLocation}
      />

      <PermissionItem
        title="Notifications"
        isGranted={permissions.notifications}
        onPress={requestNotifications}
      />

      {Platform.OS === 'android' && (
        <TouchableOpacity style={styles.appSettingsButton} onPress={openAppSettings}>
          <Text style={styles.appSettingsText}>Open App Settings</Text>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* About section */}
      <Text style={styles.sectionTitle}>About</Text>

      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>Shul Lock</Text>
        <Text style={styles.aboutVersion}>Version 1.0.0</Text>
        <Text style={styles.aboutDesc}>
          Minimise distractions in shul. Your location data is stored locally and never uploaded.
        </Text>
      </View>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
  );
}

function SettingSwitch({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={() => onValueChange(!value)}
      activeOpacity={0.7}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.lightGray, true: Colors.activeGreenLight }}
        thumbColor={value ? Colors.activeGreen : Colors.mediumGray}
      />
    </TouchableOpacity>
  );
}

function PermissionItem({
  title,
  isGranted,
  onPress,
}: {
  title: string;
  isGranted: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.permissionRow}
      onPress={isGranted ? undefined : onPress}
      activeOpacity={isGranted ? 1 : 0.7}
      disabled={isGranted}
    >
      <Text style={styles.permissionIcon}>{isGranted ? '✅' : '⚠️'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text
          style={[
            styles.permissionStatus,
            { color: isGranted ? Colors.activeGreen : Colors.errorRed },
          ]}
        >
          {isGranted ? 'Granted' : 'Not Granted — Tap to grant'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.navy800,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  settingTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.nearBlack,
  },
  settingDesc: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: Spacing.md,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm + 4,
  },
  permissionIcon: {
    fontSize: 20,
  },
  permissionStatus: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  appSettingsButton: {
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  appSettingsText: {
    fontSize: FontSize.md,
    color: Colors.navy700,
    fontWeight: '500',
  },
  aboutCard: {
    backgroundColor: Colors.lightGray + '80',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  aboutTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.nearBlack,
  },
  aboutVersion: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  aboutDesc: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});
