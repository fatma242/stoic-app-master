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
import i18n from "../constants/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { HeaderWithNotifications } from "../components/HeaderWithNotifications";
import { useNotifications } from "./Notification";

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
  
  const { addNotification } = useNotifications();

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const [key, setKey] = useState(0);

  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert(
            i18n.t('weeklyCheckIn.errors.userNotFound'),
            i18n.t('weeklyCheckIn.errors.userNotFound')
          );
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
          Alert.alert(
            i18n.t('weeklyCheckIn.alerts.alreadySubmitted'),
            i18n.t('weeklyCheckIn.alerts.alreadySubmitted')
          );
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
        Alert.alert(
          i18n.t('weeklyCheckIn.errors.fetchFailed'),
          i18n.t('weeklyCheckIn.errors.fetchFailed')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to schedule weekly check-in reminder notification
  const scheduleWeeklyReminder = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;

      // Create a reminder notification for next week
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      addNotification({
        id: Date.now(),
        title: i18n.t('weeklyCheckIn.notifications.weeklyReminderTitle') || "Weekly Check-in Reminder",
        message: i18n.t('weeklyCheckIn.notifications.weeklyReminderMessage') || "It's time for your weekly mental health check-in! Take a moment to reflect on your week.",
        createdAt: nextWeek.toISOString(),
        isRead: false,
        type: "REMINDER"
      });

      // Also create a progress update reminder
      addNotification({
        id: Date.now() + 1,
        title: i18n.t('weeklyCheckIn.notifications.progressReminderTitle') || "Progress Update Reminder", 
        message: i18n.t('weeklyCheckIn.notifications.progressReminderMessage') || "Don't forget to update your daily progress tracker to maintain your wellness journey!",
        createdAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        isRead: false,
        type: "REMINDER"
      });
    } catch (error) {
      console.error("Error scheduling reminders:", error);
    }
  };

  useEffect(() => {
    scheduleWeeklyReminder();
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      Alert.alert(i18n.t('weeklyCheckIn.errors.incompleteAnswers'));
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert(
          i18n.t('weeklyCheckIn.errors.userNotFound'),
          i18n.t('weeklyCheckIn.errors.userNotFound')
        );
        return;
      }

      let score = 0;
      Object.values(answers).forEach((ans) => {
        if (ans === i18n.t('weeklyCheckIn.answers.yes')) score += 2;
        else if (ans === i18n.t('weeklyCheckIn.answers.sometimes')) score += 1;
      });

      await axios.post(`${API_BASE_URL}/api/mood-logs`, {
        userId: userId,
        moodScore: score,
        timestamp: new Date().toISOString(),
      });

      // Schedule reminder notifications for next week and progress update
      scheduleWeeklyReminder();

      // Create immediate congratulatory notification
      addNotification({
        id: Date.now() + 2,
        title: i18n.t('weeklyCheckIn.notifications.completionTitle') || "Weekly Check-in Completed!",
        message: i18n.t('weeklyCheckIn.notifications.completionMessage') || "Great job completing your weekly mental health check-in! Your wellness journey continues.",
        createdAt: new Date().toISOString(),
        isRead: false,
        type: "ACHIEVEMENT"
      });

      Alert.alert(
        i18n.t('weeklyCheckIn.alerts.success'),
        i18n.t('weeklyCheckIn.alerts.reminderMessage'),
        [
          { 
            text: i18n.t('weeklyCheckIn.alerts.updateProgress') || "Update Progress", 
            onPress: () => router.replace("/progress") 
          },
          { 
            text: i18n.t('weeklyCheckIn.navigation.later') || "Later", 
            style: "cancel"
          },
        ]
      );
    } catch (err) {
      console.error(err);
      Alert.alert(
        i18n.t('weeklyCheckIn.errors.submitFailed'),
        i18n.t('weeklyCheckIn.errors.submitFailed')
      );
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
    <View style={styles.container} key={key}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{
        position: 'absolute',
        top: 40,
        right: 10,
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      }}>
        <HeaderWithNotifications 
          isRTL={isRTL}
          style={{ backgroundColor: 'transparent' }}
        />
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />

      <KeyboardAvoidingView behavior="padding" style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {/* Progress reminder */}
            <TouchableOpacity 
              style={styles.progressReminder}
              onPress={() => router.push("/progress")}
            >
              <Text style={styles.progressReminderText}>
                {i18n.t('weeklyCheckIn.alerts.progressReminder')}
              </Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.questionText, { textAlign }]}>{currentQuestion}</Text>

              <View style={[styles.optionsContainer, { flexDirection }]}>
                {[
                  i18n.t('weeklyCheckIn.answers.yes'),
                  i18n.t('weeklyCheckIn.answers.no'),
                  i18n.t('weeklyCheckIn.answers.sometimes')
                ].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
                      if (currentQuestionIndex < questions.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }
                    }}
                    style={[
                      styles.optionButton,
                      answers[currentQuestionIndex] === option && styles.selectedOption
                    ]}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.navigationContainer, { flexDirection }]}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity 
                  onPress={() => setCurrentQuestionIndex(prev => prev - 1)}
                  style={styles.previousButton}
                >
                  <Text style={styles.previousText}>
                    {i18n.t('weeklyCheckIn.navigation.previous')}
                  </Text>
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
                        <Text style={styles.buttonText}>
                          {i18n.t('weeklyCheckIn.navigation.submit')}
                        </Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  languageContainer: {
    alignSelf: "flex-end",
    zIndex: 2,
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
  },
  questionText: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  optionsContainer: {
    justifyContent: "space-around",
    width: '100%',
  },
  optionButton: {
    padding: 12,
    backgroundColor: "#ffffff30",
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    minWidth: 100,
  },
  selectedOption: {
    backgroundColor: "#16A34A",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: '500',
  },
  navigationContainer: {
    width: '100%',
    marginTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousButton: {
    padding: 10,
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
  progressReminder: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
  },
  progressReminderText: {
    color: '#22C55E',
    fontSize: 14,
    fontStyle: 'italic',
  },
});