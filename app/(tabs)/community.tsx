import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

type UserRole = 'admin' | 'moderator' | 'user';

export default function Home() {
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole>('admin'); // Replace with actual auth logic
  const [rooms, setRooms] = useState([
    { id: '1', name: 'Anxiety Support', members: 238 },
    { id: '2', name: 'Stress Relief', members: 195 },
  ]);

  const isAdmin = userRole === 'admin' || userRole === 'moderator';

  // Room Management Functions
  const handleCreateRoom = () => {
    Alert.prompt('Create New Room', 'Enter room name:', (text) => {
      if (text) {
        setRooms([...rooms, { id: Date.now().toString(), name: text, members: 0 }]);
      }
    });
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  const handleUpdateRoom = (roomId: string) => {
    Alert.prompt('Update Room', 'Enter new name:', (text) => {
      if (text) {
        setRooms(rooms.map(room => 
          room.id === roomId ? { ...room, name: text } : room
        ));
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require("../../assets/background.mp4")}
        style={styles.backgroundVideo}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />

      {/* Overlay */}
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with Admin Controls */}
        <View style={styles.header}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.greeting}>Welcome Back!</Text>
          
          {isAdmin && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={handleCreateRoom}
            >
              <Ionicons name="add-circle" size={24} color="#16A34A" />
              <Text style={styles.adminButtonText}>Create Room</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Room Management Section */}
        {isAdmin && (
          <LinearGradient
            colors={['#16A34A30', '#0d421530']}
            style={styles.adminSection}
          >
            <Text style={styles.sectionTitle}>Manage Rooms</Text>
            {rooms.map(room => (
              <View key={room.id} style={styles.roomItem}>
                <View>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <Text style={styles.roomMembers}>{room.members} members</Text>
                </View>
                <View style={styles.roomActions}>
                  <TouchableOpacity onPress={() => handleUpdateRoom(room.id)}>
                    <Ionicons name="pencil" size={20} color="#16A34A" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDeleteRoom(room.id)}
                    style={{ marginLeft: 15 }}
                  >
                    <Ionicons name="trash" size={20} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </LinearGradient>
        )}

        {/* Existing Components... */}

        {/* Modified Recent Activity with Mod Controls */}
        <LinearGradient
          colors={['#16A34A20', '#0d421520']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#7CFC00" />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Completed mindfulness exercise</Text>
              {isAdmin && (
                <TouchableOpacity style={styles.modControl}>
                  <Ionicons name="remove-circle" size={18} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

// Add these new styles to existing StyleSheet
const styles = StyleSheet.create({
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
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  roomActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  modControl: {
    marginLeft: 10,
    padding: 5,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 10,
  },
  cardText: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 15,
  },
  checkinButton: {
    backgroundColor: '#7CFC00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#000',
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
  },
  gridText: {
    color: '#fff',
    marginTop: 10,
    fontWeight: '500',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ffffff20',
  },
  activityText: {
    color: '#fff',
    marginLeft: 10,
    flex: 1,
  },
});