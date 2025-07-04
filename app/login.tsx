import BackgroundVideo from "@/components/BackgroundVideo";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useLayoutEffect } from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "../constants/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";


  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  console.log("API_BASE_URL:", API_BASE_URL);

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [key, setKey] = useState(0);
  
  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);
  
  
  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';

  useEffect(() => {
    const checkLoggedIn = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        router.replace("/home");
      }
    };
    checkLoggedIn();
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      router.replace("/");
      return true;
    });
    return () => backHandler.remove();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = i18n.t("login.emailRequired");
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = i18n.t("login.passwordRequired");
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = i18n.t("login.passwordShort");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);

    const { username: email, password } = formData;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "";

      if (response.status === 401) {
        if (errorText.includes("User not found")) {
          errorMessage = i18n.t("login.userNotExist");
        } else if (errorText.includes("Incorrect password")) {
          errorMessage = i18n.t("login.incorrectPassword");
        } else {
          errorMessage = i18n.t("login.emailInvalid"); 
        }
      } else {
        errorMessage = "An error occurred. Please try again.";
      }

      Alert.alert(i18n.t("login.errorTitle"), errorMessage);
      return;
    }


      const data: { userId: string; email: string } = await response.json();

      if (!data?.userId || !data?.email) {
        Alert.alert(i18n.t("login.errorTitle"), "Invalid user data returned from server.");
        return;
      }

      await AsyncStorage.setItem("userId", String(data.userId));
      await AsyncStorage.setItem("userEmail", data.email);
      router.replace("/home");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      Alert.alert(i18n.t("login.errorTitle"), message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 40 , marginRight: 10, alignSelf: "flex-end" }}>
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>{i18n.t("login.title")}</Text>
          <Text style={styles.subtitle}>{i18n.t("login.subtitle")}</Text>

          <View style={styles.formContainer}>
            <View
              style={[
                styles.inputContainer,
                errors.username ? styles.inputError : null,
              ]}
            >
              <MaterialIcons
                name="person"
                size={24}
                color="#16A34A"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={i18n.t("login.email")}
                placeholderTextColor="#aaa"
                value={formData.username}
                onChangeText={(text) => handleChange("username", text)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.username && (
              <Text style={styles.errorText}>{errors.username}</Text>
            )}

            <View
              style={[
                styles.inputContainer,
                errors.password ? styles.inputError : null,
              ]}
            >
              <MaterialIcons
                name="lock"
                size={24}
                color="#16A34A"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={i18n.t("login.password")}
                placeholderTextColor="#aaa"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={["#16A34A", "#0d4215"]}
                style={[
                  styles.buttonGradient,
                  loading ? styles.buttonDisabled : null,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>{i18n.t("login.login")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {i18n.t("login.dontHaveAccount")}{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.replace("/signup")}
              >
                {i18n.t("login.signUp")}
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  backgroundVideo: {
    position: "absolute", top: 0, left: 0, bottom: 0, right: 0,
  },
  overlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  contentContainer: { flex: 1, width: "100%" },
  scrollContainer: {
    flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20,
  },
  logo: { width: 150, height: 150, marginBottom: 10 },
  title: {
    fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16, color: "#fff", opacity: 0.8, marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2,
  },
  formContainer: { width: "100%", alignItems: "center", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 15, paddingVertical: 12,
    borderRadius: 10, width: "90%", marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 3, elevation: 3,
  },
  inputError: { borderWidth: 1, borderColor: "#ff4444" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#000", paddingVertical: 2 },
  eyeIcon: { padding: 5, marginLeft: 5 },
  button: { width: "90%", marginTop: 15 },
  buttonGradient: {
    padding: 15, borderRadius: 10, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 3,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "white" },
  errorText: {
    color: "#ff4444", alignSelf: "flex-start",
    marginLeft: "5%", marginBottom: 10, fontSize: 13,
  },
  loginContainer: { marginTop: 10 },
  loginText: { fontSize: 14, color: "#fff", opacity: 0.8 },
  loginLink: { color: "#7CFC00", fontWeight: "bold" },
});
