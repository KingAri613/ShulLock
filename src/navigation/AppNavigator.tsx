import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ShulListScreen from '../screens/ShulListScreen';
import AddEditShulScreen from '../screens/AddEditShulScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ShulLockActiveScreen from '../screens/ShulLockActiveScreen';
import { Colors } from '../constants/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.offWhite },
        headerTintColor: Colors.nearBlack,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: Colors.offWhite },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShulList"
        component={ShulListScreen}
        options={{ title: 'Manage Shuls' }}
      />
      <Stack.Screen
        name="AddEditShul"
        component={AddEditShulScreen}
        options={({ route }) => ({
          title: route.params?.shulId ? 'Edit Shul' : 'Add Shul',
        })}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="ShulLockActive"
        component={ShulLockActiveScreen}
        options={{
          headerShown: false,
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
