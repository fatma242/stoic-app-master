import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'ADMIN' | 'REG';

type Room = {
  roomId: number;
  roomName: string;
  type: 'PUBLIC' | 'PRIVATE';
  createdAt: string;
  owner?: {
    username: string;
    userRole: UserRole;
  };
};

export default function Community() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>('REG');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const BACKEND_URL = 'http://192.168.1.6:8100';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const idString = await AsyncStorage.getItem('userId');
        if (!idString) throw new Error('No user ID stored');
        const userId = Number(idString);

        const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to fetch user');
        const data = await res.json();
        setUserRole(data.userRole as UserRole);
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  useEffect(() => {
    fetch(`${BACKEND_URL}/rooms/visible`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch rooms');
        return res.json();
      })
      .then((data: Room[]) => setRooms(data))
      .catch(err => Alert.alert('Error', err.message))
      .finally(() => setLoadingRooms(false));
  }, []);

  const loading = loadingUser || loadingRooms;

  const handleCreateRoom = () => {
    const defaultType = userRole === 'ADMIN' ? 'PUBLIC' : 'PRIVATE';
    const buttonLabel = userRole === 'ADMIN' ? 'Create Public Room' : 'Create Private Room';

    Alert.prompt(
      buttonLabel,
      'Enter room name:',
      roomName => {
        if (!roomName) return;
        fetch(`${BACKEND_URL}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            roomName,
            type: defaultType,
          }),
        })
          .then(async res => {
            if (!res.ok) {
              const text = await res.text();
              throw new Error(text || 'Failed to create room');
            }
            return res.json();
          })
          .then(newRoom => setRooms(prev => [...prev, newRoom]))
          .catch(err => Alert.alert('Error', err.message));
      },
      'plain-text'
    );
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/background.mp4')}
        style={styles.backgroundVideo}
        rate={1.0}
        volume={1.0}
        isMuted
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.greeting}>Welcome to the Community!</Text>

          {loading ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <TouchableOpacity style={styles.createButton} onPress={handleCreateRoom}>
                <Ionicons
                  name={userRole === 'ADMIN' ? 'earth' : 'lock-closed'}
                  size={24}
                  color="#fff"
                />
                <Text style={styles.createButtonText}>
                  {userRole === 'ADMIN' ? 'Create Public Room' : 'Create Private Room'}
                </Text>
              </TouchableOpacity>

              <LinearGradient colors={['#16A34A30', '#0d421530']} style={styles.roomsSection}>
                <Text style={styles.sectionTitle}>Available Rooms</Text>
                {rooms.map(room => (
                  <View key={room.roomId} style={styles.roomItem}>
                    <Text style={styles.roomName}>{room.roomName}</Text>
                    <Text style={styles.roomDetails}>
                      {room.type} • by {room.owner?.username ?? 'Unknown'}
                    </Text>
                  </View>
                ))}
              </LinearGradient>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundVideo: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  content: { padding: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  greeting: { fontSize: 24, color: '#fff', fontWeight: '600' },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  createButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  roomsSection: {
    borderRadius: 15,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 15,
  },
  roomItem: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  roomDetails: {
    color: '#ffffff80',
    fontSize: 12,
  },
});
