import BackgroundVideo from "@/components/BackgroundVideo";
import React from "react";
import { useEffect, useState, useRef } from "react";
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
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type FieldName =
  | "username"
  | "email"
  | "password"
  | "confirmPassword"
  | "gender"
  | "age";

type FormDataType = Record<FieldName, string>;
type ErrorsType = Record<FieldName, string>;

export default function SignUp() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormDataType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ErrorsType>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    age: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Enhanced animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [progressAnim] = useState(new Animated.Value(0));
  const [breathingAnim] = useState(new Animated.Value(1));
  const [floatingAnim] = useState(new Animated.Value(0));
  const [shimmerAnim] = useState(new Animated.Value(0));

  // Input focus animations
  const [focusedField, setFocusedField] = useState("");
  const inputAnimations = useRef<{ [key: string]: Animated.Value }>({
    username: new Animated.Value(0),
    email: new Animated.Value(0),
    password: new Animated.Value(0),
    confirmPassword: new Animated.Value(0),
    age: new Animated.Value(0),
  }).current;

  const steps = [
    {
      title: "Welcome to Stoic",
      subtitle: "Begin your journey to mental wellness",
      fields: ["username", "email"],
      icon: "🌱",
      color: "#4ECDC4",
    },
    {
      title: "Secure Your Space",
      subtitle: "Create a safe sanctuary for your thoughts",
      fields: ["password", "confirmPassword"],
      icon: "🔐",
      color: "#45B7A8",
    },
    {
      title: "Personal Touch",
      subtitle: "Help us tailor your healing experience",
      fields: ["gender", "age"],
      icon: "🌟",
      color: "#3DA58A",
    },
  ];

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    startContinuousAnimations();
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (currentStep > 0) {
          handleBack();
          return true;
        }
        router.replace("/");
        return true;
      }
    );
    return () => backHandler.remove();
  }, [currentStep]);

  useEffect(() => {
    animateStepTransition();
  }, [currentStep]);

  const startContinuousAnimations = () => {
    // Breathing animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(breathingAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(breathingAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Floating animation for decorative elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  };

  const animateStepTransition = () => {
    // Reset animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.95);
    rotateAnim.setValue(0);

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: (currentStep + 1) / steps.length,
      duration: 800,
      useNativeDriver: false,
    }).start();

    // Main content animation
    Animated.parallel([
      Animated.spring(fadeAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateInputFocus = (fieldName: string, focused: boolean) => {
    setFocusedField(focused ? fieldName : "");
    Animated.spring(inputAnimations[fieldName], {
      toValue: focused ? 1 : 0,
      tension: 100,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const validateCurrentStep = () => {
    let valid = true;
    const newErrors = { ...errors };
    const currentFields = steps[currentStep].fields;

    currentFields.forEach((field) => {
      if (field === "username") {
        if (!formData.username.trim()) {
          newErrors.username = "Username is required";
          valid = false;
        } else if (formData.username.length < 3) {
          newErrors.username = "Username must be at least 3 characters";
          valid = false;
        } else {
          newErrors.username = "";
        }
      }

      if (field === "email") {
        if (!formData.email.trim()) {
          newErrors.email = "Email is required";
          valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = "Please enter a valid email";
          valid = false;
        } else {
          newErrors.email = "";
        }
      }

      if (field === "password") {
        if (!formData.password) {
          newErrors.password = "Password is required";
          valid = false;
        } else if (formData.password.length < 6) {
          newErrors.password = "Password must be at least 6 characters";
          valid = false;
        } else {
          newErrors.password = "";
        }
      }

      if (field === "confirmPassword") {
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "Passwords don't match";
          valid = false;
        } else {
          newErrors.confirmPassword = "";
        }
      }

      if (field === "gender") {
        if (!formData.gender) {
          newErrors.gender = "Please select your gender";
          valid = false;
        } else {
          newErrors.gender = "";
        }
      }

      if (field === "age") {
        const age = parseInt(formData.age);
        if (!formData.age) {
          newErrors.age = "Age is required";
          valid = false;
        } else if (isNaN(age) || age < 13 || age > 120) {
          newErrors.age = "Please enter a valid age (13-120)";
          valid = false;
        } else {
          newErrors.age = "";
        }
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (name: FieldName, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    // Pulse animation for button feedback
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSignUp();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSignUp = async () => {
    if (!validateCurrentStep()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          gender: formData.gender,
          age: parseInt(formData.age),
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
      await AsyncStorage.setItem("UserRole", data.role);
      await AsyncStorage.setItem("onboardingStatus", data.onboardingStatus);

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

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressTrack}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
        <View style={styles.progressSteps}>
          {steps.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.progressStep,
                {
                  backgroundColor:
                    index <= currentStep ? "#4ECDC4" : "rgba(255,255,255,0.3)",
                  transform: [
                    {
                      scale: index === currentStep ? 1.2 : 1,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
      <Text style={styles.progressText}>
        {currentStep + 1} of {steps.length}
      </Text>
    </View>
  );

  const renderFloatingElements = () => (
    <View style={styles.floatingElements}>
      {[...Array(6)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.floatingElement,
            {
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              transform: [
                {
                  translateY: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10 - i * 2],
                  }),
                },
                {
                  rotate: floatingAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["0deg", `${10 + i * 5}deg`],
                  }),
                },
              ],
              opacity: 0.1 + i * 0.05,
            },
          ]}
        >
          <Text style={styles.floatingEmoji}>
            {["🌿", "🌱", "🍃", "✨", "💚", "🌸"][i]}
          </Text>
        </Animated.View>
      ))}
    </View>
  );

  const renderGenderSelection = () => (
    <View style={styles.genderContainer}>
      {[
        {
          key: "female",
          label: "Female",
          icon: "female",
          gradient: ["#FF6B9D", "#C44569"],
        },
        {
          key: "male",
          label: "Male",
          icon: "male",
          gradient: ["#4ECDC4", "#44A08D"],
        },
      ].map((gender) => (
        <TouchableOpacity
          key={gender.key}
          style={[
            styles.genderButton,
            formData.gender === gender.key && styles.genderButtonActive,
          ]}
          onPress={() => handleChange("gender", gender.key)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              formData.gender === gender.key
                ? (gender.gradient as [string, string])
                : (["rgba(255,255,255,0.1)", "rgba(255,255,255,0.1)"] as [
                    string,
                    string
                  ])
            }
            style={styles.genderGradient}
          >
            <View style={styles.genderIconContainer}>
              <FontAwesome5
                name={gender.icon}
                size={28}
                color={formData.gender === gender.key ? "#fff" : "#4ECDC4"}
              />
            </View>
            <Text
              style={[
                styles.genderLabel,
                formData.gender === gender.key && styles.genderLabelActive,
              ]}
            >
              {gender.label}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderCurrentStepFields = () => {
    const currentFields = steps[currentStep].fields as FieldName[];
    return currentFields.map((field: FieldName) => {
      if (field === "gender") {
        return (
          <Animated.View
            key={field}
            style={[
              styles.fieldContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.fieldLabel}>Choose your identity</Text>
            {renderGenderSelection()}
            {errors.gender && (
              <Animated.Text style={styles.errorText}>
                {errors.gender}
              </Animated.Text>
            )}
          </Animated.View>
        );
      }

      if (field === "age") {
        return (
          <Animated.View
            key={field}
            style={[
              styles.fieldContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.inputContainer,
                errors.age && styles.inputError,
                {
                  borderColor: inputAnimations.age.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.1)", "#4ECDC4"],
                  }),
                  borderWidth: inputAnimations.age.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }),
                  shadowOpacity: inputAnimations.age.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.3],
                  }),
                },
              ]}
            >
              <BlurView intensity={80} style={styles.inputBlur}>
                <MaterialIcons
                  name="cake"
                  size={24}
                  color="#4ECDC4"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Your age"
                  placeholderTextColor="rgba(255,255,255,0.6)"
                  value={formData.age}
                  onChangeText={(text) => handleChange("age", text)}
                  onFocus={() => animateInputFocus("age", true)}
                  onBlur={() => animateInputFocus("age", false)}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </BlurView>
            </Animated.View>
            {errors.age && (
              <Animated.Text style={styles.errorText}>
                {errors.age}
              </Animated.Text>
            )}
          </Animated.View>
        );
      }

      return (
        <Animated.View
          key={field}
          style={[
            styles.fieldContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.inputContainer,
              errors[field] && styles.inputError,
              {
                borderColor:
                  inputAnimations[field]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.1)", "#4ECDC4"],
                  }) || "rgba(255,255,255,0.1)",
                borderWidth:
                  inputAnimations[field]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2],
                  }) || 1,
                shadowOpacity:
                  inputAnimations[field]?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.3],
                  }) || 0.1,
              },
            ]}
          >
            <BlurView intensity={80} style={styles.inputBlur}>
              <MaterialIcons
                name={
                  field === "username"
                    ? "person"
                    : field === "email"
                    ? "email"
                    : "lock"
                }
                size={24}
                color="#4ECDC4"
                style={styles.icon}
              />
              <TextInput
                style={styles.input}
                placeholder={
                  field === "confirmPassword"
                    ? "Confirm your password"
                    : field === "username"
                    ? "Choose a username"
                    : field === "email"
                    ? "Your email address"
                    : "Create a password"
                }
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={formData[field]}
                onChangeText={(text) => handleChange(field, text)}
                onFocus={() => animateInputFocus(field, true)}
                onBlur={() => animateInputFocus(field, false)}
                keyboardType={field === "email" ? "email-address" : "default"}
                secureTextEntry={
                  field === "password"
                    ? !showPassword
                    : field === "confirmPassword"
                    ? !showConfirmPassword
                    : false
                }
              />
              {(field === "password" || field === "confirmPassword") && (
                <TouchableOpacity
                  onPress={() =>
                    field === "password"
                      ? setShowPassword(!showPassword)
                      : setShowConfirmPassword(!showConfirmPassword)
                  }
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      field === "password"
                        ? showPassword
                          ? "eye-off"
                          : "eye"
                        : showConfirmPassword
                        ? "eye-off"
                        : "eye"
                    }
                    size={20}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              )}
            </BlurView>
          </Animated.View>
          {errors[field] && (
            <Animated.Text style={styles.errorText}>
              {errors[field]}
            </Animated.Text>
          )}
        </Animated.View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <BackgroundVideo />
      <View style={styles.overlay} />
      {renderFloatingElements()}

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.contentContainer}
      >
        {renderProgressBar()}

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.animatedContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
              },
            ]}
          >
            {/* Logo with breathing animation */}
            <Animated.View
              style={[
                styles.logoContainer,
                {
                  transform: [{ scale: breathingAnim }],
                },
              ]}
            >
              <Image
                source={require("../assets/logo.png")}
                style={styles.logo}
              />
              <View style={styles.logoGlow} />
            </Animated.View>

            {/* Step indicator */}
            <Animated.View
              style={[
                styles.stepIndicator,
                {
                  transform: [
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0deg", "360deg"],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.stepEmoji}>{steps[currentStep].icon}</Text>
            </Animated.View>

            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>

            <View style={styles.formContainer}>
              {renderCurrentStepFields()}
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNext}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Animated.View
                  style={[
                    styles.buttonContent,
                    {
                      transform: [{ scale: pulseAnim }],
                    },
                  ]}
                >
                  <LinearGradient
                    colors={["#4ECDC4", "#44A08D", "#358F80"]}
                    style={[
                      styles.buttonGradient,
                      loading && styles.buttonDisabled,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.buttonText}>
                          {currentStep === steps.length - 1
                            ? "Begin Your Journey"
                            : "Continue"}
                        </Text>
                        <MaterialIcons
                          name="arrow-forward"
                          size={20}
                          color="#fff"
                          style={styles.buttonIcon}
                        />
                      </>
                    )}
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>

              {currentStep > 0 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleBack}
                  activeOpacity={0.7}
                >
                  <BlurView intensity={20} style={styles.secondaryButtonBlur}>
                    <MaterialIcons
                      name="arrow-back"
                      size={20}
                      color="rgba(255,255,255,0.8)"
                      style={styles.backIcon}
                    />
                    <Text style={styles.secondaryButtonText}>Back</Text>
                  </BlurView>
                </TouchableOpacity>
              )}
            </View>

            {currentStep === 0 && (
              <Animated.View
                style={[
                  styles.loginContainer,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <Text style={styles.loginText}>
                  Already part of our community?{" "}
                  <Text
                    style={styles.loginLink}
                    onPress={() => router.replace("/login")}
                  >
                    Welcome back
                  </Text>
                </Text>
              </Animated.View>
            )}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#000
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor: "rgba(5, 15, 25, 0.4)", // Much lighter overlay
  },
  floatingElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingElement: {
    position: "absolute",
    zIndex: 1,
  },
  floatingEmoji: {
    fontSize: 20,
    opacity: 0.3,
  },
  contentContainer: {
    flex: 1,
    width: "100%",
    zIndex: 2,
  },
  progressContainer: {
    paddingHorizontal: 25,
    paddingTop: Constants.statusBarHeight + 30,
    paddingBottom: 20,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    marginBottom: 15,
    position: "relative",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#4ECDC4",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  progressSteps: {
    position: "absolute",
    top: -5,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  progressStep: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  progressText: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  animatedContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoContainer: {
    position: "relative",
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    opacity: 0.95,
  },
  logoGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 60,
    backgroundColor: "#4ECDC4",
    opacity: 0.1,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  stepIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    borderWidth: 2,
    borderColor: "#4ECDC4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  stepEmoji: {
    fontSize: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "300",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: 1,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 40,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  formContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 30,
  },
  fieldContainer: {
    width: "100%",
    marginBottom: 20,
  },
  fieldLabel: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 5,
    borderRadius: 20,
    color: "rgba(255, 4, 4, 0.05)",
    backgroundColor: "rgba(255, 4, 4, 0.05)",
    overflow: "hidden",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  inputBlur: {
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 20,
    // paddingVertical: 18,
    // backgroundColor: "rgba(255, 255, 255, 0.05)",
    backgroundColor: "rgba(255, 4, 4, 0.05)",
    backdropFilter: "blur(20px)",
  },
  inputError: {
    borderColor: "#ff6b6b",
    shadowColor: "#ff6b6b",
  },
  icon: {
    marginRight: 15,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    backgroundColor: "rgba(255, 4, 4, 0.05)",
    paddingVertical: 2,
    fontWeight: "300",
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 5,
    borderRadius: 15,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    // paddingHorizontal: 10,
    // gap: 15,
  },
  genderButton: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    color: "rgba(255, 255, 255, 0.1)",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  genderButtonActive: {
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  genderGradient: {
    alignItems: "center",
    // padding: 25,
    minHeight: 120,
    justifyContent: "center",
  },
  genderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.1)",

    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  genderLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  genderLabelActive: {
    color: "#fff",
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    gap: 15,
  },
  primaryButton: {
    width: "100%",
  },
  buttonContent: {
    width: "100%",
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    letterSpacing: 1,
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  secondaryButton: {
    width: "100%",
    borderRadius: 20,
    overflow: "hidden",
  },
  secondaryButtonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 25,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  backIcon: {
    marginRight: 8,
  },
  secondaryButtonText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 13,
    marginTop: 8,
    marginLeft: 10,
    fontWeight: "400",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loginContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  loginText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    fontWeight: "300",
    letterSpacing: 0.5,
  },
  loginLink: {
    color: "#4ECDC4",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
