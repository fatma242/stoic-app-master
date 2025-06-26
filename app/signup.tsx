import React, { useState, useEffect } from "react";
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
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.2:8100";

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        router.replace("/");
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      valid = false;
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Registration failed");

      await AsyncStorage.setItem("isLoggedIn", "true");
      await AsyncStorage.setItem("userEmail", formData.email);
      if (data.userId !== undefined) {
        await AsyncStorage.setItem("userId", String(data.userId));
        console.log("✅ Stored userId:", data.userId);
      }

      router.replace("/onboarding");
    } catch (error) {
      Alert.alert(
        "Registration Error",
        error instanceof Error ? error.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/background.mp4")}
        style={styles.backgroundVideo}
        isMuted
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
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
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our wellness community</Text>

          <View style={styles.formContainer}>
            {["username", "email", "password", "confirmPassword"].map(
              (field) => (
                <View key={field}>
                  <View
                    style={[
                      styles.inputContainer,
                      errors[field as keyof typeof errors] && styles.inputError,
                    ]}
                  >
                    <MaterialIcons
                      name={field.includes("email") ? "email" : "lock"}
                      size={24}
                      color="#16A34A"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder={
                        field === "confirmPassword"
                          ? "Confirm Password"
                          : field.charAt(0).toUpperCase() + field.slice(1)
                      }
                      placeholderTextColor="#aaa"
                      value={formData[field as keyof typeof formData]}
                      onChangeText={(text) => handleChange(field, text)}
                      keyboardType={
                        field === "email" ? "email-address" : "default"
                      }
                      secureTextEntry={
                        field.includes("password") &&
                        (field === "password"
                          ? !showPassword
                          : !showConfirmPassword)
                      }
                    />
                    {field.includes("password") && (
                      <TouchableOpacity
                        onPress={() =>
                          field === "password"
                            ? setShowPassword(!showPassword)
                            : setShowConfirmPassword(!showConfirmPassword)
                        }
                        style={styles.eyeIcon}
                      >
                        <Ionicons
                          name={
                            (
                              field === "password"
                                ? showPassword
                                : showConfirmPassword
                            )
                              ? "eye-off"
                              : "eye"
                          }
                          size={20}
                          color="#666"
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                  {errors[field as keyof typeof errors] && (
                    <Text style={styles.errorText}>
                      {errors[field as keyof typeof errors]}
                    </Text>
                  )}
                </View>
              )
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              <LinearGradient
                colors={["#16A34A", "#0d4215"]}
                style={[
                  styles.buttonGradient,
                  loading && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Already have an account?{" "}
              <Text
                style={styles.loginLink}
                onPress={() => router.replace("/login")}
              >
                Log in
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
  contentContainer: { flex: 1, width: "100%" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: { width: 150, height: 150, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#fff", opacity: 0.8, marginBottom: 30 },
  formContainer: { width: "100%", alignItems: "center", marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
  buttonText: { fontSize: 16, fontWeight: "bold", color: "white" },
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
