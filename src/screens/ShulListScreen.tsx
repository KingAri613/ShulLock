import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useShulLock } from '../store/ShulLockContext';
import ShulListItem from '../components/ShulListItem';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';
import { Shul } from '../types/Shul';

type ShulListNav = NativeStackNavigationProp<RootStackParamList, 'ShulList'>;

export default function ShulListScreen() {
  const navigation = useNavigation<ShulListNav>();
  const { shuls, toggleShulEnabled, deleteShul } = useShulLock();
  const [shulToDelete, setShulToDelete] = useState<Shul | null>(null);

  return (
    <View style={styles.container}>
      {shuls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No shuls added yet.{'\n'}Tap + to add your first shul.
          </Text>
        </View>
      ) : (
        <FlatList
          data={shuls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ShulListItem
              shul={item}
              onToggleEnabled={() => toggleShulEnabled(item.id)}
              onEdit={() => navigation.navigate('AddEditShul', { shulId: item.id })}
              onDelete={() => setShulToDelete(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditShul', {})}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Delete confirmation */}
      <Modal
        visible={!!shulToDelete}
        transparent
        animationType="fade"
        onRequestClose={() => setShulToDelete(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete</Text>
            <Text style={styles.dialogMessage}>
              Delete "{shulToDelete?.name}"? This cannot be undone.
            </Text>
            <View style={styles.dialogActions}>
              <TouchableOpacity onPress={() => setShulToDelete(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (shulToDelete) {
                    deleteShul(shulToDelete.id);
                    setShulToDelete(null);
                  }
                }}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 26,
  },
  listContent: {
    padding: Spacing.md,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.navy800,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '300',
    marginTop: -2,
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
    gap: Spacing.md,
  },
  cancelText: {
    fontSize: FontSize.md,
    color: Colors.mediumGray,
    fontWeight: '600',
    padding: Spacing.sm,
  },
  deleteText: {
    fontSize: FontSize.md,
    color: Colors.errorRed,
    fontWeight: '600',
    padding: Spacing.sm,
  },
});
