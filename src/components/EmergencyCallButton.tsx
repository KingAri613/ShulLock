import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Linking,
  StyleSheet,
  Platform,
} from 'react-native';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { Config } from '../constants/config';

interface EmergencyCallButtonProps {
  style?: object;
}

export default function EmergencyCallButton({ style }: EmergencyCallButtonProps) {
  const [showDialog, setShowDialog] = useState(false);

  const makeEmergencyCall = () => {
    setShowDialog(false);
    const url = Platform.OS === 'android'
      ? `tel:${Config.EMERGENCY_NUMBER}`
      : `telprompt:${Config.EMERGENCY_NUMBER}`;
    Linking.openURL(url).catch(() => {
      // Fallback
      Linking.openURL(`tel:${Config.EMERGENCY_NUMBER}`);
    });
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, style]}
        onPress={() => setShowDialog(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>📞</Text>
        <Text style={styles.text}>Emergency Call</Text>
      </TouchableOpacity>

      <Modal
        visible={showDialog}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDialog(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Emergency Call</Text>
            <Text style={styles.dialogMessage}>
              This will dial the emergency number. Continue?
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDialog(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.callButton}
                onPress={makeEmergencyCall}
              >
                <Text style={styles.callText}>Call</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.emergencyRed,
  },
  icon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  text: {
    color: Colors.emergencyRed,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 340,
  },
  dialogTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.nearBlack,
    marginBottom: Spacing.sm,
  },
  dialogMessage: {
    fontSize: FontSize.md,
    color: Colors.darkGray,
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.mediumGray,
    fontWeight: '600',
  },
  callButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.emergencyRed,
  },
  callText: {
    fontSize: FontSize.md,
    color: Colors.white,
    fontWeight: '700',
  },
});
