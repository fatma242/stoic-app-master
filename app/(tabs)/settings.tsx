import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.8:8100";

export default function Settings() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

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
      Alert.alert("Logout Error", "Failed to log out.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    Alert.alert("Confirm", "Are you sure you want to delete your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API_BASE_URL}/api/users/${userId}`, {
              method: "DELETE",
            });
            await AsyncStorage.clear();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to delete account.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Video
        source={require("../../assets/background.mp4")}
        style={styles.backgroundVideo}
        isMuted
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.greeting}>Settings</Text>
        </View>

        <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.card}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push("../editProfile")}
          >
            <Ionicons name="person" size={24} color="#7CFC00" />
            <Text style={styles.settingText}>Edit Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#7CFC00" />
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={["#FF4444", "#8B0000"]}
          style={[styles.card, { marginTop: 20 }]}
        >
          <TouchableOpacity style={styles.dangerItem} onPress={handleLogout}>
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
  container: { flex: 1 },
  backgroundVideo: { ...StyleSheet.absoluteFillObject },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: { padding: 20, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 30 },
  logo: { width: 100, height: 100, marginBottom: 15 },
  greeting: { fontSize: 24, color: "#fff", fontWeight: "600" },
  card: { borderRadius: 15, padding: 20, marginBottom: 20 },
  cardTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },
  settingText: { color: "#fff", flex: 1, marginLeft: 15, fontSize: 16 },
  dangerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  dangerText: {
    color: "#FFF",
    marginLeft: 15,
    fontSize: 16,
    fontWeight: "500",
  },
});
