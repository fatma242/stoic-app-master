import React from 'react';
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
      <Stack>
        {/* Public screens */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        
        {/* Authentication screens */}
        <Stack.Screen 
          name="signup" 
          options={{ 
            headerShown: false,
            animation: 'fade'
          }} 
        />
         <Stack.Screen 
          name="login"  
          options={{ 
            headerShown: false,
            animation: 'fade'
          }}
        />

        <Stack.Screen name="PrivacyPolicy" options={{ title: 'Privacy Policy', headerShown: false }} />
        <Stack.Screen name="TermsOfService" options={{ title: 'Terms of Service', headerShown: false }} />

        {/* Authenticated tabs */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Catch-all route */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}