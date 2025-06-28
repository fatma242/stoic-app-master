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

const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};

export default function WeeklyCheckIn() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not found. Please log in again.");
          router.replace("/login");
          return;
        }

        // Check if user already submitted this week's check-in
        const response = await axios.get(`${API_BASE_URL}/api/mood-logs/${userId}`);
        const logs = response.data;
        const now = new Date();
        const currentWeek = getWeekNumber(now);

        const hasSubmitted = logs.some((log: any) => {
          const logDate = new Date(log.timestamp);
          const logWeek = getWeekNumber(logDate);
          return logWeek.week === currentWeek.week && logWeek.year === currentWeek.year;
        });

        if (hasSubmitted) {
          Alert.alert("Already Submitted", "You've already completed your weekly check-in.");
          router.replace("/progress");
          return;
        }

        // Fetch user status
        const res = await fetch(`${API_BASE_URL}/api/users/status/${userId}`);
        const data = await res.json();
        setStatus(data);

        let statusQuestions: any = [];
        if (data === "ANXIETY") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.anxiety", { returnObjects: true });
        } else if (data === "STRESS") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.stress", { returnObjects: true });
        } else if (data === "DEPRESSION") {
          statusQuestions = i18n.t("weeklyCheckIn.questions.depression", { returnObjects: true });
        } else {
          statusQuestions = i18n.t("weeklyCheckIn.questions.normal", { returnObjects: true });
        }

        const questionTexts = Object.values(statusQuestions);
        setQuestions(questionTexts as string[]);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      let score = 0;
      Object.values(answers).forEach((ans) => {
        if (ans === "Yes") score += 2;
        else if (ans === "Sometimes") score += 1;
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

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <BackgroundVideo />
      <View style={styles.overlay} />

      <KeyboardAvoidingView behavior="padding" style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.title}>How are you feeling this week?</Text>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ color: "#fff", fontSize: 16, marginBottom: 8 }}>{currentQuestion}</Text>

              <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                {["Yes", "No", "Sometimes"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }
                    }}
                    style={{
                      padding: 10,
                      backgroundColor:
                        answers[currentQuestionIndex] === option ? "#16A34A" : "#ffffff30",
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ color: "#fff" }}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.navigationContainer}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity 
                  onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                  style={styles.previousButton}
                >
                  <Text style={styles.previousText}>Previous</Text>
                </TouchableOpacity>
              )}

              {currentQuestionIndex === questions.length - 1 && (
                <View style={styles.submitContainer}>
                  <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={submitting}
                    style={styles.submitButton}
                  >
                    <LinearGradient 
                      colors={["#16A34A", "#0d4215"]} 
                      style={styles.buttonGradient}
                    >
                      {submitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>Submit</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}
            </View>
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
    backgroundColor: "rgba(0, 0, 0, 0)",
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
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.13)",
    borderRadius: 20,
    padding: 30,
    width: "90%",
    maxWidth: 380,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  navigationContainer: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  previousButton: {
    position: 'absolute',
    left: 0,
  },
  previousText: {
    color: '#ccc',
    fontSize: 16,
  },
  submitContainer: {
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
