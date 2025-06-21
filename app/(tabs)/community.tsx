import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

type UserRole = 'admin' | 'moderator' | 'user';

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
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = userRole === 'admin' || userRole === 'moderator';
  const BACKEND_URL = 'http://192.168.210.193:8100'; 

  // Get user role
  useEffect(() => {
  fetch(`${BACKEND_URL}/api/users/session`, {
    credentials: 'include',
  })
    .then(res => res.json())
    .then(data => {
      if (data.role === 'ADMIN') setUserRole('admin');
      else if (data.role === 'MOD') setUserRole('moderator');
      else setUserRole('user');
    })
    .catch(() => setUserRole('user'));
}, []);

  // Fetch rooms visible to user
  useEffect(() => {
    fetch(`${BACKEND_URL}/rooms/visible`, {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => Alert.alert("Error", "Failed to load rooms"))
      .finally(() => setLoading(false));
  }, []);

  // Create room (admins/mods only)
  const handleCreateRoom = () => {
    Alert.prompt('Create Room', 'Enter room name:', (roomName) => {
      if (!roomName) return;
      fetch(`${BACKEND_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          roomName: roomName,
          type: 'PUBLIC', // You could add an option to choose PRIVATE
        }),
      })
        .then(res => res.json())
        .then(newRoom => setRooms(prev => [...prev, newRoom]))
        .catch(() => Alert.alert('Error', 'Failed to create room'));
    });
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
          {isAdmin && (
            <TouchableOpacity style={styles.adminButton} onPress={handleCreateRoom}>
              <Ionicons name="add-circle" size={24} color="#16A34A" />
              <Text style={styles.adminButtonText}>Create Room</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          <LinearGradient colors={['#16A34A30', '#0d421530']} style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Available Rooms</Text>
            {rooms.map(room => (
              <View key={room.roomId} style={styles.roomItem}>
                <View>
                  <Text style={styles.roomName}>{room.roomName}</Text>
                  <Text style={styles.roomMembers}>
                    {room.type} • Created by {room.owner?.username || 'Unknown'}
                  </Text>
                </View>
              </View>
            ))}
          </LinearGradient>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: { padding: 20, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  greeting: { fontSize: 24, color: '#fff', fontWeight: '600' },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  adminButtonText: {
    color: '#16A34A',
    marginLeft: 8,
    fontWeight: '600',
  },
  adminSection: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 15,
  },
  roomItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  roomMembers: {
    color: '#ffffff80',
    fontSize: 12,
  },
});
