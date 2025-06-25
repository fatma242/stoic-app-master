import BackgroundVideo from "@/components/BackgroundVideo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Define the User type
type User = {
  id: string;
  userId?: string;
  username: string;
  email: string;
  password: string;
  userRole: string;
};

const API_BASE_URL = "http://192.168.1.6:8100";

export default function EditProfile() {
  const navigation = useNavigation();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

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
        // Convert to integer and guard against NaN
        const userIdint = parseInt(userID, 10);
        if (isNaN(userIdint)) {
          Alert.alert("Error", "Stored user ID is not a valid number");
          return;
        }
        // Fetch *only* the current user
        const res = await fetch(`${API_BASE_URL}/api/users/${userIdint}`, {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }

        const currentUser: User = await res.json();
        console.log("Fetched user:", currentUser);

        setUser(currentUser);
        setName(currentUser.username);
        setEmail(currentUser.email);

        // ensure we keep the ID in AsyncStorage too
        if (currentUser.userId) {
          await AsyncStorage.setItem("userId", String(currentUser.userId));
        } else {
          console.warn("⚠️ userId missing on payload:", currentUser);
        }
      } catch (error) {
        console.error("❌ fetchUser failed:", error);
        Alert.alert(
          "Error",
          "Failed to fetch user data. See console for details."
        );
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert("Validation", "Username and email cannot be empty.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const allowedDomains = [".com", ".org", ".edu"];
    const domain = email.slice(email.lastIndexOf("."));

    if (!emailRegex.test(email) || !allowedDomains.includes(domain)) {
      Alert.alert("Validation", "Email must end with .com, .org, or .edu");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      Alert.alert("Validation", "Password must be at least 6 characters.");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID is missing.");
        return;
      }

      const updatedUser = {
        username: name,
        email,
        password: newPassword || user?.password || "",
        userRole: user?.userRole || "REG",
      };

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error();

      await AsyncStorage.setItem("userEmail", email);
      Alert.alert("Success", "Profile updated successfully.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundVideo />
      <View style={styles.overlay} />
      <View style={styles.innerContainer}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <Text style={styles.title}>Edit Profile</Text>

        <TextInput
          style={styles.input}
          value={name}
          placeholder="Username"
          placeholderTextColor="#999"
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="Email"
          placeholderTextColor="#999"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          placeholder="New Password (optional)"
          placeholderTextColor="#999"
          secureTextEntry
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  innerContainer: { flex: 1, justifyContent: "center", padding: 20 },
  logo: { width: 80, height: 80, alignSelf: "center", marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
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
  },
  button: {
    backgroundColor: "#16a34a",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
