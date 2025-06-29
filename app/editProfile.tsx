import BackgroundVideo from "@/components/BackgroundVideo";
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import Constants from "expo-constants";
import i18n from "../constants/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type User = {
  id: string;
  userId?: string;
  username: string;
  email: string;
  password: string;
  userRole: string;
  status?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function EditProfile() {
  const navigation = useNavigation();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [key, setKey] = useState(0);

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);


  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem("userEmail");
        const userID = await AsyncStorage.getItem("userId");
        if (!storedEmail || !userID) {
          console.log("🛑 Missing storedEmail or userID:", {
            storedEmail,
            userID,
          });
          return;
        }

        const userIdint = parseInt(userID, 10);
        if (isNaN(userIdint)) {
          Alert.alert(
            i18n.t('editProfile.validation.error'),
            i18n.t('editProfile.validation.userIdMissing')
          );
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/${userIdint}`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error(`Server returned ${res.status}`);

        const currentUser: User = await res.json();
        console.log("✅ Fetched user:", currentUser);

        setUser(currentUser);
        setName(currentUser.username);
        setEmail(currentUser.email);
        setStatus(currentUser.status || "");

        await AsyncStorage.setItem("userStatus", currentUser.status || "");

        if (currentUser.userId) {
          await AsyncStorage.setItem("userId", String(currentUser.userId));
        }
      } catch (error) {
        console.error("❌ fetchUser failed:", error);
        Alert.alert(
          i18n.t('editProfile.validation.error'),
          i18n.t('editProfile.validation.fetchError')
        );
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert(
        i18n.t('editProfile.validation.error'),
        i18n.t('editProfile.validation.emptyFields')
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedDomains = [".com", ".org", ".edu"];
    const domain = email.slice(email.lastIndexOf("."));

    if (!emailRegex.test(email) || !allowedDomains.includes(domain)) {
      Alert.alert(
        i18n.t('editProfile.validation.error'),
        i18n.t('editProfile.validation.invalidEmail')
      );
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert(
        i18n.t('editProfile.validation.error'),
        i18n.t('editProfile.validation.shortPassword')
      );
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert(
          i18n.t('editProfile.validation.error'),
          i18n.t('editProfile.validation.userIdMissing')
        );
        return;
      }

      const updatedUser = {
        username: name,
        email,
        password: newPassword || user?.password || "",
        userRole: user?.userRole || "REG",
        status: status,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error();

      await AsyncStorage.setItem("userEmail", email);
      Alert.alert(
        i18n.t('editProfile.validation.success'),
        i18n.t('editProfile.validation.success'),
        [
          { 
            text: "OK", 
            onPress: () => router.back() 
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        i18n.t('editProfile.validation.error'),
        i18n.t('editProfile.validation.error')
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.languageContainer, { marginTop: 40, marginRight: 10 }]}>
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />
      <View style={styles.innerContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={[styles.title, { textAlign }]}>
          {i18n.t('editProfile.title')}
        </Text>

        <TextInput
          style={[styles.input, { textAlign }]}
          value={name}
          placeholder={i18n.t('editProfile.usernamePlaceholder')}
          placeholderTextColor="#999"
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, { textAlign }]}
          value={email}
          placeholder={i18n.t('editProfile.emailPlaceholder')}
          placeholderTextColor="#999"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { textAlign }]}
          value={newPassword}
          placeholder={i18n.t('editProfile.passwordPlaceholder')}
          placeholderTextColor="#999"
          secureTextEntry
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>
            {i18n.t('editProfile.saveButton')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  languageContainer: {
    alignItems: "flex-end",
    paddingHorizontal: 20,
    zIndex: 2,
  },
  innerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 20 
  },
  logo: { 
    width: 80, 
    height: 80, 
    alignSelf: "center", 
    marginBottom: 20 
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 30,
    color: "#fff",
  },
  input: {
    borderWidth: 1,
    borderColor: "#16a34a",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: "#fff",
    color: "#000",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});