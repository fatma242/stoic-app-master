import BackgroundVideo from "@/components/BackgroundVideo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "@/constants/i18n";

export default function WeeklyCheckIn() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchStatusAndQuestions = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not found. Please log in again.");
          router.replace("/login");
          return;
        }

        // Fetch status from backend
        const response = await axios.get(`${API_BASE_URL}/api/status/${userId}`);
        const userStatus = response.data.status;
        console.log("User status from API:", userStatus);

        let statusKey = userStatus?.toLowerCase();

        let statusQuestions: any = [];
        if (statusKey === "anxiety") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.anxiety", { returnObjects: true });
        } else if (statusKey === "stress") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.stress", { returnObjects: true });
        } else if (statusKey === "depression") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.depression", { returnObjects: true });
        } else {
          statusQuestions = i18n.t("weeklyCheckIn.questions.normal", { returnObjects: true });
        }

        console.log("Fetched questions object:", statusQuestions);

        const questionTexts = Object.values(statusQuestions);
        console.log("Question texts array:", questionTexts);

        setQuestions(questionTexts as string[]);
        setStatus(statusKey);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch status or questions");
      } finally {
        setLoading(false);
      }
    };

    fetchStatusAndQuestions();
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      Alert.alert("Please answer all questions.");
      return;
    }

    setSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      // Calculate score like emojis logic
      let score = 0;
      Object.values(answers).forEach((ans) => {
        if (ans === "Yes") score += 2;
        else if (ans === "Sometimes") score += 1;
        // No = 0
      });

      await axios.post(`${API_BASE_URL}/api/mood-logs`, {
        userId: userId,
        moodScore: score,
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Success", "Your check-in has been recorded!", [
        { text: "OK", onPress: () => router.replace("/progress") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit check-in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <BackgroundVideo />
      <View style={styles.overlay} />

      <KeyboardAvoidingView behavior="padding" style={styles.contentContainer}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.title}>How are you feeling this week?</Text>

            <View>
              {questions.map((q, index) => (
                <View key={index} style={{ marginBottom: 20 }}>
                  <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>{q}</Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                    {["Yes", "No", "Sometimes"].map((option) => (
                      <TouchableOpacity
                        key={option}
                        onPress={() => setAnswers((prev) => ({ ...prev, [index]: option }))}
                        style={{
                          padding: 10,
                          backgroundColor: answers[index] === option ? "#16A34A" : "#ffffff30",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ color: "#fff" }}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={submitting}
            >
              <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.buttonGradient}>
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Submit</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderRadius: 20,
    padding: 30,
    width: "90%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  submitButton: {
    width: "100%",
    marginTop: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonGradient: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});