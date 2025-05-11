import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';

export default function Progress() {
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
          <Text style={styles.greeting}>Your Progress</Text>
        </View>

        {/* Streak Card */}
        <LinearGradient
          colors={['#16A34A', '#0d4215']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>3-Day Mindfulness Streak! 🔥</Text>
          <Text style={styles.cardText}>Keep going to unlock new achievements</Text>
          <View style={styles.progressContainer}>
            <Ionicons name="flame" size={40} color="#FFD700" />
            <Text style={styles.streakNumber}>3</Text>
          </View>
        </LinearGradient>

        {/* Mood Trends */}
        <LinearGradient
          colors={['#16A34A20', '#0d421520']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Mood Trends</Text>
          <View style={styles.chartPlaceholder}>
            <Ionicons name="stats-chart" size={50} color="#16A34A" />
            <Text style={styles.chartText}>Mood Chart (Last 7 Days)</Text>
          </View>
        </LinearGradient>

        {/* Weekly Summary */}
        <LinearGradient
          colors={['#16A34A', '#0d4215']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Weekly Summary</Text>
          <View style={styles.activityItem}>
            <Ionicons name="checkmark-circle" size={24} color="#7CFC00" />
            <Text style={styles.activityText}>5/7 Days Completed</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="happy" size={24} color="#7CFC00" />
            <Text style={styles.activityText}>Average Mood: 4.2/5</Text>
          </View>
          <View style={styles.activityItem}>
            <Ionicons name="time" size={24} color="#7CFC00" />
            <Text style={styles.activityText}>Total Practice: 3h 20m</Text>
          </View>
        </LinearGradient>

        {/* Achievements */}
        <LinearGradient
          colors={['#16A34A20', '#0d421520']}
          style={styles.card}
        >
          <Text style={styles.cardTitle}>Recent Achievements</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.gridText}>Beginner's Mind</Text>
            </View>
            <View style={styles.gridItem}>
              <Ionicons name="heart" size={32} color="#FF69B4" />
              <Text style={styles.gridText}>Self-Care Pro</Text>
            </View>
          </View>
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
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    streakNumber: {
      fontSize: 40,
      color: '#FFD700',
      fontWeight: 'bold',
      marginLeft: 15,
    },
    chartPlaceholder: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      marginTop: 10,
    },
    chartText: {
      color: '#fff',
      marginTop: 10,
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
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 10,
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
      textAlign: 'center',
    },
  }),
});