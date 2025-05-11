import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

export default function Settings() {
  const router = useRouter();

  // Mock user data - Replace with actual session data from your backend
  const mockUser = {
    id: 1,
    username: "StoicUser",
    email: "user@stoic.com"
  };

  const handleLogout = () => {
    // Connect to your UserController.java logout endpoint
    fetch('/api/users/logout', {
      method: 'POST',
      credentials: 'include'
    }).then(() => {
      router.push('/login');
    });
  };

  const handleDeleteAccount = () => {
    // Connect to your UserController.java delete endpoint
    fetch(`/api/users/${mockUser.id}`, {
      method: 'DELETE'
    }).then(() => {
      router.push('/login');
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
        {/* Header */}
        <View style={styles.header}>
          <Image source={require("../../assets/logo.png")} style={styles.logo} />
          <Text style={styles.greeting}>Settings</Text>
        </View>

        {/* Account Section */}
        <LinearGradient
          colors={['#16A34A', '#0d4215']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Account Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/edit-profile')}
          >
            <Ionicons name="person" size={24} color="#7CFC00" />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => router.push('/change-password')}
          >
            <Ionicons name="lock-closed" size={24} color="#7CFC00" />
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>
        </LinearGradient>

        {/* App Info Section */}
        <LinearGradient
          colors={['#16A34A', '#0d4215']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>App Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Text style={styles.infoLabel}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Danger Zone */}
        <LinearGradient
          colors={['#FF4444', '#8B0000']}
          style={[styles.card, { marginTop: 20 }]}
        >
          <TouchableOpacity 
            style={styles.dangerItem}
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#FFF" />
            <Text style={styles.dangerText}>Log Out</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.dangerItem}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash" size={24} color="#FFF" />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  ...StyleSheet.create({
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
      paddingTop: 60,
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
      marginBottom: 15,
    },
    settingItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ffffff20',
    },
    settingText: {
      color: '#fff',
      flex: 1,
      marginLeft: 15,
      fontSize: 16,
    },
    infoItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ffffff20',
    },
    infoLabel: {
      color: '#fff',
      fontSize: 16,
    },
    infoValue: {
      color: '#7CFC00',
      fontSize: 16,
    },
    dangerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#ffffff20',
    },
    dangerText: {
      color: '#FFF',
      marginLeft: 15,
      fontSize: 16,
      fontWeight: '500',
    },
  }),
});