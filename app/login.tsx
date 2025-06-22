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
  BackHandler
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

  // Handle back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        router.replace('/');
        return true;
      }
    );
    return () => backHandler.remove();
  }, []);

  const validateForm = () => {
    let valid = true;
    const newErrors = { username: "", password: "" };

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const API_BASE_URL = "http://192.168.1.6:8100";

  const handleLogin = async () => {
  if (!validateForm()) return;
  setLoading(true);
  // ← add this line
  const { username: email, password } = formData;
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

if (!response.ok) {
  const err = await response.text();
  throw new Error(err);
}

const data: { userId: string; email: string } = await response.json();

// store exactly what you got
await AsyncStorage.setItem("userId", String(data.userId));
await AsyncStorage.setItem("userEmail", data.email);

    // Now both Settings and EditProfile will see a non-null userId
    router.replace("/home");

  } catch (error) {
    const message = error instanceof Error ? error.message : "Login failed";
    Alert.alert("Login Error", message);
  } finally {
    setLoading(false);
  }
};

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      <Video
        source={require("../assets/background.mp4")}
        style={styles.backgroundVideo}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <Image source={require("../assets/logo.png")} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Continue your wellness journey</Text>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Username Field */}
            <View style={[
              styles.inputContainer,
              errors.username ? styles.inputError : null
            ]}>
              <MaterialIcons name="person" size={24} color="#16A34A" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#aaa"
                value={formData.username}
                onChangeText={(text) => handleChange("username", text)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

            {/* Password Field */}
            <View style={[
              styles.inputContainer,
              errors.password ? styles.inputError : null
            ]}>
              <MaterialIcons name="lock" size={24} color="#16A34A" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
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
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient 
                colors={["#16A34A", "#0d4215"]} 
                style={[styles.buttonGradient, loading ? styles.buttonDisabled : null]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.buttonText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Signup Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              Don't have an account?{" "}
              <Text 
                style={styles.loginLink} 
                onPress={() => router.replace("/signup")}
              >
                Sign up
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 30,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
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
  inputError: {
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    paddingVertical: 2,
  },
  eyeIcon: {
    padding: 5,
    marginLeft: 5,
  },
  button: {
    width: "90%",
    marginTop: 15,
  },
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  errorText: {
    color: "#ff4444",
    alignSelf: "flex-start",
    marginLeft: "5%",
    marginBottom: 10,
    fontSize: 13,
  },
  loginContainer: {
    marginTop: 10,
  },
  loginText: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
  },
  loginLink: {
    color: "#7CFC00",
    fontWeight: "bold",
  },
});