import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShulLock } from '../store/ShulLockContext';
import StatusIndicator from '../components/StatusIndicator';
import EmergencyCallButton from '../components/EmergencyCallButton';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import * as GeofenceService from '../services/geofence';
import type { RootStackParamList } from '../navigation/types';

type HomeNav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeNav>();
  const { lockState, activateLock, deactivateLock, shuls } = useShulLock();

  // Register geofences on mount
  useEffect(() => {
    (async () => {
      const hasPerms = await GeofenceService.hasLocationPermission();
      if (hasPerms) {
        const enabled = shuls.filter((s) => s.isEnabled);
        if (enabled.length > 0) {
          await GeofenceService.registerGeofences(enabled);
        }
      }
    })();
  }, [shuls]);

  // Navigate to active screen when lock activates
  useEffect(() => {
    if (lockState.isActive) {
      navigation.navigate('ShulLockActive');
    }
  }, [lockState.isActive, navigation]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      bounces={false}
    >
      <Text style={styles.title}>Shul Lock</Text>

      {/* Status card */}
      <View
        style={[
          styles.statusCard,
          lockState.isActive && styles.statusCardActive,
        ]}
      >
        <StatusIndicator isActive={lockState.isActive} size={28} />
        <View style={{ height: Spacing.md }} />
        <Text
          style={[
            styles.statusText,
            lockState.isActive && styles.statusTextActive,
          ]}
        >
          {lockState.isActive ? 'Shul Lock is ACTIVE' : 'Shul Lock is OFF'}
        </Text>
        {lockState.isActive && lockState.activeShulName && (
          <Text style={styles.statusSubtext}>at {lockState.activeShulName}</Text>
        )}
      </View>

      {/* Action buttons */}
      {!lockState.isActive ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => activateLock()}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>🔒  Activate Shul Lock</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.deactivateButton}
          onPress={() => deactivateLock()}
          activeOpacity={0.8}
        >
          <Text style={styles.deactivateButtonText}>Turn Off Shul Lock</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => navigation.navigate('ShulList')}
        activeOpacity={0.7}
      >
        <Text style={styles.outlineButtonText}>📍  Manage Shuls</Text>
      </TouchableOpacity>

      <Text style={styles.shulCount}>
        {shuls.length} shul{shuls.length !== 1 ? 's' : ''} configured
      </Text>

      <TouchableOpacity
        style={styles.settingsLink}
        onPress={() => navigation.navigate('Settings')}
        activeOpacity={0.7}
      >
        <Text style={styles.settingsLinkText}>⚙️  Settings</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />

      <EmergencyCallButton style={styles.emergencyButton} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
    color: Colors.nearBlack,
    marginBottom: Spacing.xl,
  },
  statusCard: {
    width: '100%',
    backgroundColor: Colors.lightGray + '80',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  statusCardActive: {
    backgroundColor: Colors.activeGreen + '18',
  },
  statusText: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.nearBlack,
    textAlign: 'center',
  },
  statusTextActive: {
    color: Colors.activeGreen,
  },
  statusSubtext: {
    fontSize: FontSize.md,
    color: Colors.mediumGray,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.navy800,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  deactivateButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.errorRed,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  deactivateButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  outlineButton: {
    width: '100%',
    height: 56,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  outlineButtonText: {
    color: Colors.navy800,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  shulCount: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.lg,
  },
  settingsLink: {
    paddingVertical: Spacing.sm,
  },
  settingsLinkText: {
    fontSize: FontSize.md,
    color: Colors.navy700,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  emergencyButton: {
    marginBottom: Spacing.md,
  },
});
