import BackgroundVideo from "@/components/BackgroundVideo";
import { AntDesign, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { useEffect, useRef } from "react";
import { Animated, BackHandler, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Landing() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // const sound = useRef(new Audio.Sound()); // Sound ref commented out

  useEffect(() => {
    // Commented out sound functionality
    // async function playSound() {
    //   try {
    //     await sound.current.loadAsync(require("../assets/background-music.mp3"), { shouldPlay: true });
    //     await sound.current.setIsLoopingAsync(true);
    //     await sound.current.setVolumeAsync(0.5);
    //   } catch (error) {
    //     console.log("Error loading sound:", error);
    //   }
    // }
    // playSound();

    // return () => {
    //   sound.current.unloadAsync();
    // };
  }, []);

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
    const onBackPress = () => {
      // Prevent going back to login
      return true;
    };
    BackHandler.addEventListener("hardwareBackPress", onBackPress);

    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
  }, []);

  useEffect(() => {
    // Fade-in animation (kept active)
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <BackgroundVideo />
      <View style={styles.overlay} />
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.subtitle}>Your daily mental wellness companion</Text>

      <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.googleButton}>
          <AntDesign name="google" size={24} color="black" />
          <Text style={styles.googleText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.emailButton} onPress={() => router.push("/signup")}>
          <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.emailButtonGradient}>
            <MaterialIcons name="email" size={24} color="white" />
            <Text style={styles.emailText}>Sign up with Email</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      <Text style={styles.loginText}>
        Already have an account?
        <Text style={styles.loginLink} onPress={() => router.replace("/login")}>
          {" "}Log in
        </Text>
      </Text>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  backgroundVideo: { position: "absolute", top: 0, left: 0, bottom: 0, right: 0 },
  
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)", // Subtle overlay for better contrast
  },

  logo: { width: 170, height: 170, marginBottom: 15 },
  
  subtitle: { 
    textAlign: "center", 
    marginBottom: 40, 
    opacity: 0.85, 
    fontSize: 16, 
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  buttonContainer: { width: "100%", alignItems: "center" },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  googleText: { fontSize: 16, fontWeight: "bold", marginLeft: 10, color: "black" },

  emailButton: { width: "90%" },

  emailButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },

  emailText: { fontSize: 16, fontWeight: "bold", color: "white", marginLeft: 10 },

  loginText: { marginTop: 20, textAlign: "center", fontSize: 14, opacity: 0.85, color: "#fff" },
  loginLink: { color: "#7CFC00", fontWeight: "bold" },
});
