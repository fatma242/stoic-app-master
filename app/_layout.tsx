import React, { useEffect } from 'react';
import { AppState } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { NotificationProvider, useNotifications } from './Notification';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Component to handle app state changes
const AppStateHandler = () => {
  const { fetchNotifications, connectWebSocket } = useNotifications();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        console.log('📱 App became active - refreshing notifications');
        fetchNotifications();
        connectWebSocket();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  return null;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <NotificationProvider>
      <AppStateHandler />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
              screenOptions={{
                  headerShown: false,    // hide the native header everywhere
                  animation: 'fade',      // optional: a default animation
              }}
          >
              {/* Public screens */}
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" />

              {/* Authentication screens */}
              <Stack.Screen name="signup" />
              <Stack.Screen name="login" />

              {/* Authenticated tabs */}
              <Stack.Screen name="(tabs)" />

              {/* Additional screens */}
              <Stack.Screen name="room" />
              <Stack.Screen name="post-details" />
              <Stack.Screen name="chat" />
              <Stack.Screen name="editProfile" />
              <Stack.Screen name="weekly_check-in" />
              <Stack.Screen name="Notification" />
              <Stack.Screen name="PrivacyPolicy" />
              <Stack.Screen name="TermsOfService" />

              {/* Catch-all route */}
              <Stack.Screen name="+not-found" />
          </Stack>

          <StatusBar style="auto" />
      </ThemeProvider>
    </NotificationProvider>
  );
}