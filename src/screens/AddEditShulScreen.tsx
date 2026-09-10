import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useShulLock } from '../store/ShulLockContext';
import { Shul, SearchResult } from '../types/Shul';
import { Config } from '../constants/config';
import { Colors, FontSize, Spacing, BorderRadius } from '../constants/theme';
import * as Location from 'expo-location';
import type { RootStackParamList } from '../navigation/types';

type AddEditRoute = RouteProp<RootStackParamList, 'AddEditShul'>;

export default function AddEditShulScreen() {
  const navigation = useNavigation();
  const route = useRoute<AddEditRoute>();
  const { shuls, addShul, updateShul } = useShulLock();

  const editId = route.params?.shulId;
  const existingShul = editId ? shuls.find((s) => s.id === editId) : null;
  const isEditing = !!existingShul;

  const [name, setName] = useState(existingShul?.name ?? '');
  const [latitude, setLatitude] = useState(existingShul?.latitude?.toString() ?? '');
  const [longitude, setLongitude] = useState(existingShul?.longitude?.toString() ?? '');
  const [radius, setRadius] = useState(existingShul?.radiusMeters ?? Config.DEFAULT_RADIUS_METERS);
  const [address, setAddress] = useState(existingShul?.address ?? '');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasLocation, setHasLocation] = useState(!!existingShul);

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await Location.geocodeAsync(searchQuery.trim());
      const mapped: SearchResult[] = [];

      for (const r of results.slice(0, 5)) {
        const reverseResults = await Location.reverseGeocodeAsync({
          latitude: r.latitude,
          longitude: r.longitude,
        });
        const addr = reverseResults[0];
        const addressLine = addr
          ? [addr.name, addr.street, addr.city, addr.region, addr.country]
              .filter(Boolean)
              .join(', ')
          : `${r.latitude.toFixed(4)}, ${r.longitude.toFixed(4)}`;

        mapped.push({
          address: addressLine,
          latitude: r.latitude,
          longitude: r.longitude,
        });
      }

      setSearchResults(mapped);
      if (mapped.length === 0) {
        Alert.alert('No Results', 'No locations found for that search.');
      }
    } catch (error) {
      Alert.alert('Search Error', 'Failed to search for location.');
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: SearchResult) => {
    setLatitude(result.latitude.toString());
    setLongitude(result.longitude.toString());
    setAddress(result.address);
    setHasLocation(true);
    setSearchResults([]);
    setSearchQuery('');
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a name for this shul');
      return;
    }
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Error', 'Please select a valid location');
      return;
    }

    const shul: Shul = {
      id: existingShul?.id ?? Date.now().toString(),
      name: name.trim(),
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      address,
      isEnabled: existingShul?.isEnabled ?? true,
    };

    if (isEditing) {
      await updateShul(shul);
    } else {
      await addShul(shul);
    }

    navigation.goBack();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* Name */}
      <Text style={styles.label}>Shul Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Main Shul"
        placeholderTextColor={Colors.mediumGray}
      />

      {/* Search */}
      <Text style={styles.sectionTitle}>Select Location</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search location..."
          placeholderTextColor={Colors.mediumGray}
          returnKeyType="search"
          onSubmitEditing={searchLocation}
        />
        <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
          {isSearching ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Text style={styles.searchButtonText}>🔍</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search results */}
      {searchResults.length > 0 && (
        <View style={styles.resultsCard}>
          {searchResults.map((result, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultItem}
              onPress={() => selectResult(result)}
            >
              <Text style={styles.resultText}>{result.address}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Manual coordinates */}
      <Text style={styles.hint}>Or enter coordinates manually:</Text>
      <View style={styles.coordRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.coordLabel}>Latitude</Text>
          <TextInput
            style={styles.input}
            value={latitude}
            onChangeText={(v) => {
              setLatitude(v);
              if (v && !isNaN(parseFloat(v))) setHasLocation(true);
            }}
            placeholder="0.0"
            placeholderTextColor={Colors.mediumGray}
            keyboardType="decimal-pad"
          />
        </View>
        <View style={{ width: Spacing.sm }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.coordLabel}>Longitude</Text>
          <TextInput
            style={styles.input}
            value={longitude}
            onChangeText={(v) => {
              setLongitude(v);
              if (v && !isNaN(parseFloat(v))) setHasLocation(true);
            }}
            placeholder="0.0"
            placeholderTextColor={Colors.mediumGray}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      {/* Address display */}
      {address ? <Text style={styles.addressText}>{address}</Text> : null}

      {/* Radius */}
      <Text style={styles.sectionTitle}>Radius: {Math.round(radius)} metres</Text>
      <Slider
        style={styles.slider}
        minimumValue={Config.MIN_RADIUS_METERS}
        maximumValue={Config.MAX_RADIUS_METERS}
        step={25}
        value={radius}
        onValueChange={setRadius}
        minimumTrackTintColor={Colors.navy800}
        maximumTrackTintColor={Colors.lightGray}
        thumbTintColor={Colors.navy800}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{Config.MIN_RADIUS_METERS}m</Text>
        <Text style={styles.sliderLabel}>{Config.MAX_RADIUS_METERS}m</Text>
      </View>

      {/* Save */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          (!name.trim() || !hasLocation) && styles.saveButtonDisabled,
        ]}
        onPress={save}
        disabled={!name.trim() || !hasLocation}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>

      <View style={{ height: Spacing.xl }} />
    </ScrollView>
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
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.nearBlack,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: FontSize.md,
    color: Colors.nearBlack,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.nearBlack,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  searchButton: {
    backgroundColor: Colors.navy800,
    borderRadius: BorderRadius.sm,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  resultsCard: {
    backgroundColor: Colors.lightGray,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  resultItem: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.sm,
  },
  resultText: {
    fontSize: FontSize.md,
    color: Colors.nearBlack,
  },
  hint: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.sm,
  },
  coordRow: {
    flexDirection: 'row',
  },
  coordLabel: {
    fontSize: FontSize.sm,
    color: Colors.mediumGray,
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: FontSize.sm,
    color: Colors.navy800,
    marginBottom: Spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  sliderLabel: {
    fontSize: FontSize.xs,
    color: Colors.mediumGray,
  },
  saveButton: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.navy800,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
});
