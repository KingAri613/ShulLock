import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShulLockProvider } from './src/store/ShulLockContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ShulLockProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="dark" />
        </NavigationContainer>
      </ShulLockProvider>
    </SafeAreaProvider>
  );
}
