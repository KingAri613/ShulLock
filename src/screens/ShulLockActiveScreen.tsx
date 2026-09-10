import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useShulLock } from '../store/ShulLockContext';
import EmergencyCallButton from '../components/EmergencyCallButton';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

export default function ShulLockActiveScreen() {
  const navigation = useNavigation();
  const { lockState, deactivateLock } = useShulLock();
  const [currentTime, setCurrentTime] = useState(getTime());

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Navigate back when deactivated
  useEffect(() => {
    if (!lockState.isActive) {
      navigation.goBack();
    }
  }, [lockState.isActive, navigation]);

  const handleDeactivate = async () => {
    await deactivateLock();
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacerTop} />

      {/* Lock icon */}
      <Text style={styles.lockIcon}>🔒</Text>

      <View style={{ height: Spacing.lg }} />

      {/* Time */}
      <Text style={styles.time}>{currentTime}</Text>

      <View style={{ height: Spacing.lg }} />

      {/* Status */}
      <Text style={styles.status}>Shul Lock is ACTIVE</Text>

      {lockState.activeShulName && (
        <Text style={styles.shulName}>at {lockState.activeShulName}</Text>
      )}

      <Text style={styles.silentText}>Your phone is silent</Text>

      <View style={styles.spacerMiddle} />

      {/* Emergency call */}
      <EmergencyCallButton style={styles.emergencyButton} />

      <View style={{ height: Spacing.lg }} />

      {/* Turn off button */}
      <TouchableOpacity
        style={styles.turnOffButton}
        onPress={handleDeactivate}
        activeOpacity={0.7}
      >
        <Text style={styles.turnOffText}>Turn Off Shul Lock</Text>
      </TouchableOpacity>

      <View style={styles.spacerBottom} />
    </View>
  );
}

function getTime(): string {
  const now = new Date();
  const h = now.getHours().toString().padStart(2, '0');
  const m = now.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.nearBlack,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  spacerTop: {
    flex: 0.3,
  },
  lockIcon: {
    fontSize: 56,
  },
  time: {
    fontSize: 72,
    fontWeight: '200',
    color: Colors.offWhite,
    textAlign: 'center',
    letterSpacing: 2,
  },
  status: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    color: Colors.gold500,
    textAlign: 'center',
  },
  shulName: {
    fontSize: FontSize.lg,
    color: Colors.offWhite + 'B3',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  silentText: {
    fontSize: FontSize.md,
    color: Colors.offWhite + '80',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  spacerMiddle: {
    flex: 0.4,
  },
  emergencyButton: {
    alignSelf: 'stretch',
    borderColor: Colors.offWhite + '60',
  },
  turnOffButton: {
    alignSelf: 'stretch',
    height: 60,
    backgroundColor: Colors.offWhite + '26',
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnOffText: {
    color: Colors.offWhite,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  spacerBottom: {
    flex: 0.15,
  },
});
