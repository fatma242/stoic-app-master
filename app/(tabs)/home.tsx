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
import LanguageSwitcher from '@/components/LanguageSwitcher';
import i18n from "../../constants/i18n";
import { HeaderWithNotifications } from '../../components/HeaderWithNotifications';

export default function Home() {
  const [key, setKey] = useState(0);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

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

  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  if (!role) {
    return (
      <View style={styles.container}>
        <Text style={{ color: '#fff', marginTop: 50, textAlign: 'center' }}>
          {i18n.t('home.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container} key={key}>
      <View style={{
        position: 'absolute',
        top: 40,
        right: 10,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      }}>
        <HeaderWithNotifications 
          showBackButton={false}
          isRTL={isRTL}
          style={{ backgroundColor: 'transparent' }}
        />
        <LanguageSwitcher />
      </View>
      
      <BackgroundVideo />
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} />
          <Text style={[styles.greeting, { textAlign }]}>
            {i18n.t('home.welcomeBack')}
          </Text>
        </View>

        {/* Weekly Check-in => REG only*/}
        {role === 'REG' && (
          <LinearGradient colors={['#16A34A', '#0d4215']} style={styles.card}>
            <Text style={[styles.cardTitle, { textAlign }]}>
              {i18n.t('home.weeklyCheckin')}
            </Text>
            <Text style={[styles.cardText, { textAlign }]}>
              {i18n.t('home.howAreYou')}
            </Text>
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={() => router.push('/weekly_check-in')}
            >
              <Text style={styles.buttonText}>
                {i18n.t('home.startCheckin')}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign }]}>
            {i18n.t('home.quickAccess')}
          </Text>
          <View style={styles.grid}>
            {/* Community => all */}
            <TouchableOpacity
              onPress={() => router.push('/community')}
              style={styles.gridItem}
            >
              <Ionicons name="people" size={32} color="#16A34A" />
              <Text style={[styles.gridText, { textAlign: 'center' }]}>
                {i18n.t('home.community')}
              </Text>
            </TouchableOpacity>

            {/* AI Chat => REG only */}
            {role === 'REG' && (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/chatAI')}
              >
                <Ionicons name="chatbubbles" size={32} color="#16A34A" />
                <Text style={[styles.gridText, { textAlign: 'center' }]}>
                  {i18n.t('home.aiChat')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Progress => REG only*/}
            {role === 'REG' && (
              <TouchableOpacity
                style={styles.gridItem}
                onPress={() => router.push('/progress')}
              >
                <Ionicons name="stats-chart" size={32} color="#16A34A" />
                <Text style={[styles.gridText, { textAlign: 'center' }]}>
                  {i18n.t('home.progress')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Settings => all */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings" size={32} color="#16A34A" />
              <Text style={[styles.gridText, { textAlign: 'center' }]}>
                {i18n.t('home.settings')}
              </Text>
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
    backgroundColor: '#000',
  },
  languageContainerRTL: {
    right: undefined,
    left: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  content: {
    padding: 20,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  greeting: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  checkinButton: {
    backgroundColor: '#7CFC00',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
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
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  gridText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
});