import React from 'react';
import { I18nManager, View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/config/theme';

// Enforce Arabic Right-To-Left (RTL) layout BEFORE the app renders
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <AuthProvider>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={COLORS.primaryDark} />
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
