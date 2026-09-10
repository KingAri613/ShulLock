import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Shul } from '../types/Shul';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';

interface ShulListItemProps {
  shul: Shul;
  onToggleEnabled: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ShulListItem({
  shul,
  onToggleEnabled,
  onEdit,
  onDelete,
}: ShulListItemProps) {
  const locationText = shul.address
    ? shul.address
    : `${shul.latitude.toFixed(4)}, ${shul.longitude.toFixed(4)}`;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text
          style={[
            styles.locationIcon,
            { color: shul.isEnabled ? Colors.navy800 : Colors.mediumGray },
          ]}
        >
          📍
        </Text>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {shul.name}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {locationText}
          </Text>
          <Text style={styles.radius}>{Math.round(shul.radiusMeters)}m radius</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
          <Switch
            value={shul.isEnabled}
            onValueChange={onToggleEnabled}
            trackColor={{ false: Colors.lightGray, true: Colors.activeGreenLight }}
            thumbColor={shul.isEnabled ? Colors.activeGreen : Colors.mediumGray}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: Spacing.sm + 4,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.nearBlack,
  },
  address: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginTop: 2,
  },
  radius: {
    fontSize: FontSize.xs,
    color: Colors.mediumGray,
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconButton: {
    padding: 6,
  },
  editIcon: {
    fontSize: 16,
  },
  deleteIcon: {
    fontSize: 16,
  },
});
