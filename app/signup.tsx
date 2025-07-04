import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
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
import i18n from "../constants/i18n";
import BackgroundVideo from "@/components/BackgroundVideo";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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
  const [key, setKey] = useState(0);
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

  const isRTL = i18n.locale.startsWith("ar");

  const steps = [
    {
      title: i18n.t("signup.title"),
      subtitle: i18n.t("signup.subtitle"),
      fields: ["username", "email"],
      icon: "🌱",
      color: "#4ECDC4",
    },
    {
      title: i18n.t("signup.passwordtitle1"),
      subtitle: i18n.t("signup.passwordtitle2"),
      fields: ["password", "confirmPassword"],
      icon: "🔐",
      color: "#45B7A8",
    },
    {
      title: i18n.t("signup.identity"),
      subtitle: i18n.t("signup.subtitle2"),
      fields: ["gender", "age"],
      icon: "🌟",
      color: "#3DA58A",
    },
  ];

  useEffect(() => {
    global.reloadApp = () => setKey((prev) => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

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
          newErrors.username = i18n.t("validation.username_required");
          valid = false;
        } else if (formData.username.length < 3) {
          newErrors.username = i18n.t("validation.username_short");
          valid = false;
        } else {
          newErrors.username = "";
        }
      }

      if (field === "email") {
        if (!formData.email.trim()) {
          newErrors.email = i18n.t("validation.email_required");
          valid = false;
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          newErrors.email = i18n.t("validation.email_invalid");
          valid = false;
        } else {
          newErrors.email = "";
        }
      }

      if (field === "password") {
        if (!formData.password) {
          newErrors.password = i18n.t("validation.password_required");
          valid = false;
        } else if (formData.password.length < 6) {
          newErrors.password = i18n.t("validation.password_short");
          valid = false;
        } else {
          newErrors.password = "";
        }
      }

      if (field === "confirmPassword") {
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = i18n.t("validation.confirm_password_mismatch");
          valid = false;
        } else {
          newErrors.confirmPassword = "";
        }
      }

      if (field === "gender") {
        if (!formData.gender) {
          newErrors.gender = i18n.t("validation.gender_required");
          valid = false;
        } else {
          newErrors.gender = "";
        }
      }

      if (field === "age") {
        const age = parseInt(formData.age);
        if (!formData.age) {
          newErrors.age = i18n.t("validation.age_required");
          valid = false;
        } else if (isNaN(age) || age < 13 || age > 120) {
          newErrors.age = i18n.t("validation.age_invalid");
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
        i18n.t("signup.errorTitle"),
        error instanceof Error ? error.message : i18n.t("signup.errorGeneric")
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
                    index <= currentStep ? "#16A34A" : "rgba(255,255,255,0.3)",
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
    <View style={[styles.genderContainer, isRTL && { flexDirection: "row-reverse" }]}>
      {[
        {
          key: "female",
          label: i18n.t("signup.female"),
          icon: "female",
          gradient: ["#FF6B9D", "#C44569"],
        },
        {
          key: "male",
          label: i18n.t("signup.male"),
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
                color={formData.gender === gender.key ? "#fff" : "#16A34A"}
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
            <Text style={[styles.fieldLabel, isRTL && { textAlign: "right" }]}>
              {i18n.t("signup.identity")}
            </Text>
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
                    outputRange: ["rgba(255,255,255,0.1)", "#16A34A"],
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
                  color="#16A34A"
                  style={styles.icon}
                />
                <TextInput
                  style={[styles.input, isRTL && { textAlign: "right" }]}
                  placeholder={i18n.t("signup.age")}
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
                    outputRange: ["rgba(255,255,255,0.1)", "#16A34A"],
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
                shadowColor: "#16A34A",
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
                color="#16A34A"
                style={styles.icon}
              />
              <TextInput
                style={[styles.input, isRTL && { textAlign: "right" }]}
                placeholder={
                  field === "confirmPassword"
                    ? i18n.t("signup.confirmPassword")
                    : field === "username"
                    ? i18n.t("signup.username")
                    : field === "email"
                    ? i18n.t("signup.email")
                    : i18n.t("signup.password")
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

      <View style={[styles.languageSwitcherContainer, {marginTop:15}]}>
        <LanguageSwitcher />
      </View>

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

            <Text style={[styles.title, isRTL && { textAlign: "right" }]}>
              {steps[currentStep].title}
            </Text>
            <Text style={[styles.subtitle, isRTL && { textAlign: "right" }]}>
              {steps[currentStep].subtitle}
            </Text>

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
                    colors={["#16A34A", "#0d4215"]}
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
                            ? i18n.t("signup.beginJourney")
                            : i18n.t("signup.continue")}
                        </Text>
                        <MaterialIcons
                          name={isRTL ? "arrow-back" : "arrow-forward"}
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
                      name={isRTL ? "arrow-forward" : "arrow-back"}
                      size={20}
                      color="rgba(255,255,255,0.8)"
                      style={styles.backIcon}
                    />
                    <Text style={styles.secondaryButtonText}>
                      {i18n.t("signup.back")}
                    </Text>
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
                <Text style={[styles.loginText, isRTL && { textAlign: "right" }]}>
                  {i18n.t("signup.alreadyMember")}{" "}
                  <Text
                    style={styles.loginLink}
                    onPress={() => router.replace("/login")}
                  >
                    {i18n.t("signup.welcomeBack")}
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
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.23)",
  },
  floatingElements: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  floatingElement: {
    position: "absolute",
  },
  floatingEmoji: {
    fontSize: 40,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Constants.statusBarHeight + 20,
    paddingHorizontal: 20,
  },
  languageSwitcherContainer: {
    position: "absolute",
    top: Constants.statusBarHeight + 10,
    right: 20,
    zIndex: 100,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 40,
  },
  animatedContainer: {
    alignItems: "center",
  },
  progressContainer: {
    marginBottom: 30,
    width: "100%",
  },
  progressTrack: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#16A34A",
  },
  progressSteps: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: -12,
  },
  progressStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
  logoContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  logoGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(78, 205, 196, 0.2)",
    borderRadius: 50,
    zIndex: -1,
  },
  stepIndicator: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stepEmoji: {
    fontSize: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
    marginBottom: 30,
  },
  fieldContainer: {
    marginBottom: 20,
    width: "100%",
  },
  fieldLabel: {
    color: "#fff",
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  inputContainer: {
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  inputBlur: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 10,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  icon: {
    marginRight: 10,
  },
  eyeIcon: {
    padding: 5,
  },
  errorText: {
    color: "#FF6B6B",
    marginTop: 5,
    fontSize: 14,
  },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  genderButton: {
    width: "48%",
    borderRadius: 15,
    overflow: "hidden",
  },
  genderButtonActive: {
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  genderGradient: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  genderIconContainer: {
    marginBottom: 10,
  },
  genderLabel: {
    color: "#16A34A",
    fontWeight: "bold",
    fontSize: 16,
  },
  genderLabelActive: {
    color: "#fff",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  primaryButton: {
    width: "100%",
    marginBottom: 15,
  },
  buttonContent: {
    borderRadius: 15,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
  },
  buttonIcon: {
    marginLeft: 10,
  },
  secondaryButton: {
    width: "60%",
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  secondaryButtonBlur: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
    fontSize: 16,
  },
  backIcon: {
    marginRight: 8,
  },
  loginContainer: {
    marginTop: 20,
  },
  loginText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  loginLink: {
    color: "#16A34A",
    fontWeight: "500",
  },
});