import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

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

            {/* Catch-all route */}
            <Stack.Screen name="+not-found" />
        </Stack>

        <StatusBar style="auto" />
    </ThemeProvider>
  );
}