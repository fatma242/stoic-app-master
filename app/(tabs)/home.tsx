import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

export default function Home() {
  const router = useRouter();

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
          <Text style={styles.greeting}>Welcome Back!</Text>
        </View>

        {/* Daily Check-in */}
        <LinearGradient
          colors={['#16A34A', '#0d4215']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Daily Check-in</Text>
          <Text style={styles.cardText}>How are you feeling today?</Text>
          <TouchableOpacity 
            style={styles.checkinButton}
            onPress={() => router.push('/progress')}
          >
            <Text style={styles.buttonText}>Start Check-in</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.grid}>
            <TouchableOpacity 
              onPress={() => router.push('/community')}
              style={styles.gridItem}
            >
              <Ionicons name="people" size={32} color="#16A34A" />
              <Text style={styles.gridText}>Community</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/chatAI')}
            >
              <Ionicons name="chatbubbles" size={32} color="#16A34A" />
              <Text style={styles.gridText}>AI Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/progress')}
            >
              <Ionicons name="stats-chart" size={32} color="#16A34A" />
              <Text style={styles.gridText}>Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings" size={32} color="#16A34A" />
              <Text style={styles.gridText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <LinearGradient
          colors={['#16A34A20', '#0d421520']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#7CFC00" />
            <Text style={styles.activityText}>Completed mindfulness exercise</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="chatbox" size={24} color="#7CFC00" />
            <Text style={styles.activityText}>New message in Anxiety Support</Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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