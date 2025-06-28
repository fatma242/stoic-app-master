import BackgroundVideo from '@/components/BackgroundVideo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function Home() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const userId = await AsyncStorage.getItem('userId');
      let numericId: number | null = null;
      if (userId) {
        numericId = parseInt(userId, 10);
        setUserId(numericId);
      }
      const res = await fetch(`${API_BASE_URL}/api/users/role/${userId}`);
      const data = await res.text();
      setRole(data);
    };
    fetchRole();
  }, []);

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', marginTop: 50, textAlign: 'center' }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundVideo />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={styles.greeting}>Welcome Back!</Text>
        </View>

        {/* Weekly Check-in => REG only*/}
        {role === 'REG' && (
          <LinearGradient colors={['#16A34A', '#0d4215']} style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Check-in</Text>
            <Text style={styles.cardText}>How are you feeling now?</Text>
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => router.push('/weekly_check-in')}
            >
              <Text style={styles.buttonText}>Start Check-in</Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.grid}>
            {/* Community => all */}
            <TouchableOpacity
              onPress={() => router.push('/community')}
              style={styles.gridItem}
            >
              <Ionicons name="people" size={32} color="#16A34A" />
              <Text style={styles.gridText}>Community</Text>
            </TouchableOpacity>

            {/* AI Chat => REG only */}
            {role === 'REG' && (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/chatAI')}
              >
                <Ionicons name="chatbubbles" size={32} color="#16A34A" />
                <Text style={styles.gridText}>AI Chat</Text>
              </TouchableOpacity>
            )}

            {/* Progress => REG only*/}
            {role === 'REG' && (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/progress')}
              >
                <Ionicons name="stats-chart" size={32} color="#16A34A" />
                <Text style={styles.gridText}>Progress</Text>
              </TouchableOpacity>
            )}

            {/* Settings => all */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings" size={32} color="#16A34A" />
              <Text style={styles.gridText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
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