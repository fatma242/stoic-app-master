import BackgroundVideo from "@/components/BackgroundVideo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { useNotifications } from "./Notification";


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

const getWeekNumber = (date: Date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};

type AnswerScoreMap = { [answer: string]: number };
type ScoredQuestion = { text: string; scoreMap: AnswerScoreMap };

export default function WeeklyCheckIn() {
    const { addNotification } = useNotifications();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scoredQuestions, setScoredQuestions] = useState<ScoredQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
  const [key, setKey] = useState(0);

  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const flexDirection = isRTL ? 'row-reverse' : 'row';

  const buildScoredQuestions = (status: string): ScoredQuestion[] => {
    let rawQuestions: Record<string, string> = {};
    switch (status) {
      case "ANXIETY": {
        const result = i18n.t("weeklyCheckIn.questions.anxiety", { returnObjects: true });
        rawQuestions = typeof result === "object" && result !== null ? result as Record<string, string> : {};
        break;
      }
      case "STRESS": {
        const result = i18n.t("weeklyCheckIn.questions.stress", { returnObjects: true });
        rawQuestions = typeof result === "object" && result !== null ? result as Record<string, string> : {};
        break;
      }
      case "DEPRESSION": {
        const result = i18n.t("weeklyCheckIn.questions.depression", { returnObjects: true });
        rawQuestions = typeof result === "object" && result !== null ? result as Record<string, string> : {};
        break;
      }
      default: {
        const result = i18n.t("weeklyCheckIn.questions.normal", { returnObjects: true });
        rawQuestions = typeof result === "object" && result !== null ? result as Record<string, string> : {};
      }
    }

    const yes = i18n.t("weeklyCheckIn.answers.yes");
    const sometimes = i18n.t("weeklyCheckIn.answers.sometimes");
    const no = i18n.t("weeklyCheckIn.answers.no");

    return Object.values(rawQuestions).map((text, index) => {
      const isPositive = status === "NORMAL";
      return {
        text,
        scoreMap: isPositive
          ? { [yes]: 2, [sometimes]: 1, [no]: 0 }
          : { [yes]: 0, [sometimes]: 1, [no]: 2 },
      };
    });
  };

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => { global.reloadApp = undefined; };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert(i18n.t('weeklyCheckIn.errors.userNotFound'));
          router.replace("/login");
          return;
        }

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
          Alert.alert(i18n.t('weeklyCheckIn.alerts.alreadySubmitted'));
          router.replace("/progress");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/users/status/${userId}`);
        const data = await res.json();
        setStatus(data);
        setScoredQuestions(buildScoredQuestions(data));
      } catch (error) {
        console.error(error);
        Alert.alert(i18n.t('weeklyCheckIn.errors.fetchFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== scoredQuestions.length) {
      Alert.alert(i18n.t('weeklyCheckIn.errors.incompleteAnswers'));
      return;
    }

    setSubmitting(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert(i18n.t('weeklyCheckIn.errors.userNotFound'));
        return;
      }

      let score = 0;
      scoredQuestions.forEach((q, i) => {
        const ans = answers[i];
        if (ans in q.scoreMap) score += q.scoreMap[ans];
      });

      await axios.post(`${API_BASE_URL}/api/mood-logs`, {
        userId,
        moodScore: score,
        timestamp: new Date().toISOString(),
      });

      Alert.alert(i18n.t('weeklyCheckIn.alerts.success'), '', [
        { text: "OK", onPress: () => router.replace("/progress") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert(i18n.t('weeklyCheckIn.errors.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
  // New Notification: Weekly Check-In Reminder
  useEffect(() => {
     addNotification({
        id: Date.now(),
        title: i18n.t('weeklyCheckIn.notifications.weeklyReminderTitle') || "Weekly Check-in Reminder",
        message: i18n.t('weeklyCheckIn.notifications.weeklyReminderMessage') || "It's time for your weekly mental health check-in! Take a moment to reflect on your week.",
        createdAt: nextWeek.toISOString(),
        isRead: false,
        type: "REMINDER"
      });
  }, []);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#16A34A" /></View>;
  }

  const currentQuestion = scoredQuestions[currentQuestionIndex]?.text;

  return (
    <View style={styles.container} key={key}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.languageContainer, { marginTop: 40, marginRight: 10 }]}>
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />
      <KeyboardAvoidingView behavior="padding" style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={{ marginBottom: 20 }}>
              <Text style={[styles.questionText, { textAlign }]}>{currentQuestion}</Text>
              <View style={[styles.optionsContainer, { flexDirection }]}>
                {[i18n.t('weeklyCheckIn.answers.yes'), i18n.t('weeklyCheckIn.answers.no'), i18n.t('weeklyCheckIn.answers.sometimes')].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => {
                      setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: option }));
                      if (currentQuestionIndex < scoredQuestions.length - 1) {
                        setCurrentQuestionIndex((prev) => prev + 1);
                      }
                    }}
                    style={[styles.optionButton, answers[currentQuestionIndex] === option && styles.selectedOption]}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={[styles.navigationContainer, { flexDirection }]}>
              {currentQuestionIndex > 0 && (
                <TouchableOpacity onPress={() => setCurrentQuestionIndex(prev => prev - 1)} style={styles.previousButton}>
                  <Text style={styles.previousText}>{i18n.t('weeklyCheckIn.navigation.previous')}</Text>
                </TouchableOpacity>
              )}
              {currentQuestionIndex === scoredQuestions.length - 1 && (
                <View style={styles.submitContainer}>
                  <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.submitButton}>
                    <LinearGradient colors={["#16A34A", "#0d4215"]} style={styles.buttonGradient}>
                      {submitting ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.buttonText}>{i18n.t('weeklyCheckIn.navigation.submit')}</Text>
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
  container: { flex: 1, backgroundColor: "transparent" },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.52)", zIndex: -1 },
  contentContainer: { flex: 1, justifyContent: "center", alignItems: "center", width: "100%" },
  languageContainer: { alignSelf: "flex-end", zIndex: 2 },
  scrollContainer: { flexGrow: 1, justifyContent: "center", alignItems: "center" },
  card: { backgroundColor: "rgba(255, 255, 255, 0.13)", borderRadius: 20, padding: 30, width: "90%", maxWidth: 380, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 5, alignItems: "center" },
  questionText: { color: "#fff", fontSize: 18, marginBottom: 15, textAlign: 'center' },
  optionsContainer: { justifyContent: "space-around", width: '100%' },
  optionButton: { padding: 12, backgroundColor: "#ffffff30", borderRadius: 8, marginVertical: 5, alignItems: 'center', minWidth: 100 },
  selectedOption: { backgroundColor: "#16A34A" },
  optionText: { color: "#fff", fontSize: 16, fontWeight: '500' },
  navigationContainer: { width: '100%', marginTop: 20, justifyContent: 'space-between', alignItems: 'center' },
  previousButton: { padding: 10 },
  previousText: { color: '#ccc', fontSize: 16 },
  submitContainer: { alignItems: 'center' },
  submitButton: { borderRadius: 10, overflow: 'hidden' },
  buttonGradient: { paddingVertical: 12, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: 'white' },
});