import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Image, 
  StyleSheet,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundVideo from '@/components/BackgroundVideo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import i18n from "../../constants/i18n";
import { HeaderWithNotifications } from '../../components/HeaderWithNotifications';

export default function Settings() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const idStr = await AsyncStorage.getItem("userId");
        if (idStr) setUserId(idStr);
        console.log("User ID:", idStr);
      } catch (error) {
        console.error("❌ Failed to load userId:", error);
      }
    };

    fetchUserId();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/users/logout`, {
        method: "POST",
        credentials: "include",
      });
      await AsyncStorage.removeItem("userId");
      await AsyncStorage.removeItem("userEmail");
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        i18n.t('settings.logoutError'),
        i18n.t('settings.logoutFailed')
      );
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      Alert.alert(i18n.t('settings.deleteError'), i18n.t('settings.userIdNotFound'));
      return;
    }

    Alert.alert(
      i18n.t('settings.confirm'),
      i18n.t('settings.confirmDelete'),
      [
        { 
          text: i18n.t('settings.cancel'), 
          style: "cancel" 
        },
        {
          text: i18n.t('settings.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              await fetch(`${API_BASE_URL}/api/users/${userId}`, {
                method: "DELETE",
              });
              await AsyncStorage.clear();
              router.replace("/login");
            } catch (error) {
              Alert.alert(
                i18n.t('settings.deleteError'), 
                i18n.t('settings.deleteFailed')
              );
            }
          },
        },
      ]
    );
  };
  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

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
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={[styles.greeting, { textAlign }]}>
            {i18n.t('settings.title')}
          </Text>
        </View>

        <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.card}>
          <Text style={[styles.cardTitle, { textAlign }]}>
            {i18n.t('settings.accountSettings')}
          </Text>
          <TouchableOpacity
            style={[styles.settingItem, { flexDirection }]}
            onPress={() => router.push("../editProfile")}
          >
            <Ionicons name="person" size={24} color="#7CFC00" />
            <Text style={[styles.settingText, { textAlign }]}>
              {i18n.t('settings.editProfile')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.card}>
          <Text style={[styles.cardTitle, { textAlign }]}>
            {i18n.t('settings.appInformation')}
          </Text>

          <View style={[styles.infoItem, { flexDirection }]}>
            <Text style={[styles.infoLabel, { textAlign }]}>
              {i18n.t('settings.version')}
            </Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <TouchableOpacity
            style={[styles.infoItem, { flexDirection }]}
            onPress={() => router.push("/PrivacyPolicy")}
          >
            <Text style={[styles.infoLabel, { textAlign }]}>
              {i18n.t('settings.privacyPolicy')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.infoItem, { flexDirection }]}
            onPress={() => router.push("/TermsOfService")}
          >
            <Text style={[styles.infoLabel, { textAlign }]}>
              {i18n.t('settings.termsOfService')}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#FF4444", "#8B0000"]}
          style={[styles.card, { marginTop: 20 }]}
        >
          <TouchableOpacity 
            style={[styles.dangerItem, { flexDirection }]} 
            onPress={handleLogout}
          >
            <Ionicons name="log-out" size={24} color="#FFF" />
            <Text style={[styles.dangerText, { textAlign }]}>
              {i18n.t('settings.logOut')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.dangerItem, { flexDirection }]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash" size={24} color="#FFF" />
            <Text style={[styles.dangerText, { textAlign }]}>
              {i18n.t('settings.deleteAccount')}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  languageContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginHorizontal: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  infoLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  infoValue: {
    color: '#7CFC00',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  dangerText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 15,
  },
});