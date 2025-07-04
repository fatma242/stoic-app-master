import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabNavigator() {
  const [role, setRole] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      const storedUserId = await AsyncStorage.getItem('userId');
      const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (storedUserId) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/users/role/${storedUserId}`);
          const data = await response.text();
          setRole(data);
        } catch (error) {
          console.error('Error fetching role:', error);
        }
      }
      setIsReady(true);
    };

    fetchRole();
  }, []);

  if (!isReady) return null;

  const isRegularUser = role === 'REG';
  const isAdminOrModerator = role === 'admin' || role === 'moderator';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#16A34A',
        tabBarInactiveTintColor: '#4a6352',
        tabBarStyle: {
          backgroundColor: '#0a170c',
          borderTopColor: 'transparent',
          paddingBottom: 10,
          height: 60,
        },
        tabBarShowLabel: false,
      }}
    >
      {/* Always show home */}
      <Tabs.Screen
        name="home"
        options={{
          href: '/home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Only for REG */}
      {isRegularUser && (
        <>
          <Tabs.Screen
            name="progress"
            options={{
              href: '/progress',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="stats-chart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="chatAI"
            options={{
              href: '/chatAI',
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="chatbubbles-outline" size={size} color={color} />
              ),
              tabBarStyle: { display: 'none' },
            }}
          />
        </>
      )}

      {/* Always show community */}
      <Tabs.Screen
        name="community"
        options={{
          href: '/community',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />

      {/* Always show settings */}
      <Tabs.Screen
        name="settings"
        options={{
          href: '/settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
