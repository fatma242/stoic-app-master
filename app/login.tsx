import React, { useState, useEffect } from "react";
import BackgroundVideo from "@/components/BackgroundVideo";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  BackHandler,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../constants/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [key, setKey] = useState(0);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);


  useEffect(() => {
    AsyncStorage.getItem("userId").then((id) => {
      if (id) router.replace("/home");
    });
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
    const errs = { email: "", password: "" };

    if (!formData.email.trim()) {
      errs.email = i18n.t("login.emailRequired");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = i18n.t("login.emailInvalid");
      valid = false;
    }

    if (!formData.password) {
      errs.password = i18n.t("login.passwordRequired");
      valid = false;
    } else if (formData.password.length < 6) {
      errs.password = i18n.t("login.passwordShort");
      valid = false;
    }

    setErrors(errs);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const text = await resp.text();
      if (!resp.ok) {
        try {
          const { error } = JSON.parse(text);
          throw new Error(error || text);
        } catch {
          throw new Error(text || "Login failed");
        }
      }

      const { userId, email } = JSON.parse(text);
      await AsyncStorage.setItem("userId", String(userId));
      await AsyncStorage.setItem("userEmail", email);
      router.replace("/home");
    } catch (err) {
      Alert.alert(i18n.t("login.errorTitle"), err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 40 , marginRight: 10, alignSelf: "flex-end" }}>
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>{i18n.t("login.title")}</Text>
          <Text style={styles.subtitle}>{i18n.t("login.subtitle")}</Text>

          <View style={styles.formContainer}>
            <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
              <MaterialIcons name="email" size={24} color="#16A34A" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={i18n.t("login.email")}
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(text) => {
                  setFormData((f) => ({ ...f, email: text }));
                  if (errors.email) setErrors((e) => ({ ...e, email: "" }));
                }}
              />
            </View>
            {!!errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
              <MaterialIcons name="lock" size={24} color="#16A34A" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={i18n.t("login.password")}
                placeholderTextColor="#aaa"
                secureTextEntry={!showPassword}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData((f) => ({ ...f, password: text }));
                  if (errors.password) setErrors((e) => ({ ...e, password: "" }));
                }}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
            {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={["#16A34A", "#0d4215"]}
                style={[styles.buttonGradient, loading && styles.buttonDisabled]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>{i18n.t("login.login")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              {i18n.t("login.dontHaveAccount")}{" "}
              <Text style={styles.loginLink} onPress={() => router.replace("/signup")}>
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0, 0, 0, 0.23)" },
  contentContainer: { flex: 1, width: "100%" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  logo: { width: 150, height: 150, marginBottom: 10 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 30,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: { width: "100%", alignItems: "center", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    width: "90%",
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputError: { borderWidth: 1, borderColor: "#ff4444" },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: "#000", paddingVertical: 2 },
  eyeIcon: { padding: 5, marginLeft: 5 },
  button: { width: "90%", marginTop: 15 },
  buttonGradient: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: "bold", color: "#fff" },
  errorText: {
    color: "#ff4444",
    alignSelf: "flex-start",
    marginLeft: "5%",
    marginBottom: 10,
    fontSize: 13,
  },
  loginContainer: { marginTop: 10 },
  loginText: { fontSize: 14, color: "#fff", opacity: 0.8 },
  loginLink: { color: "#7CFC00", fontWeight: "bold" },
});
