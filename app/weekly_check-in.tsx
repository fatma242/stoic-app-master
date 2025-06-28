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

const moods = [
  { emoji: "😢", score: 1 },
  { emoji: "😔", score: 2 },
  { emoji: "😐", score: 3 },
  { emoji: "😊", score: 4 },
  { emoji: "😄", score: 5 },
];

// Helper function to get ISO week number
function getWeekNumber(d: Date): { year: number; week: number } {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return { year: d.getUTCFullYear(), week: weekNo };
}

export default function WeeklyCheckIn() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const videoRef = React.useRef(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          Alert.alert("Error", "User not found. Please log in again.");
          router.replace("/login");
          return;
        }

        // WEEKLY CHECK TEMPORARILY DISABLED FOR TESTING
        // Commented out to allow multiple submissions during testing
        /*
        const response = await axios.get(`http://192.168.1.19:8100/api/mood-logs/${userId}`);
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
            "Already Submitted",
            "You've already completed your weekly check-in.",
          );
          router.replace('/progress');
        } else {
          setLoading(false);
        }
        */

        // Bypass the weekly check and always show the form
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to initialize check-in");
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const handleSubmit = async () => {
    if (selectedMood == null) {
      Alert.alert("Please select your mood.");
      return;
    }

    setSubmitting(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User not found. Please log in again.");
        return;
      }

      await axios.post("http://192.168.1.8:8081/api/mood-logs", {
        userId: userId,
        moodScore: selectedMood,
        timestamp: new Date().toISOString(),
      });

      Alert.alert("Success", "Your mood has been recorded!", [
        { text: "OK", onPress: () => router.replace("/progress") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to submit mood. Please try again.");
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
              <Text style={styles.title}>How are you feeling today?</Text>

              <View style={styles.moods}>
                {moods.map((m) => (
                    <TouchableOpacity
                        key={m.score}
                        onPress={() => setSelectedMood(m.score)}
                        disabled={submitting}
                    >
                      <Text
                          style={[
                            styles.emoji,
                            selectedMood === m.score && styles.selected,
                          ]}
                      >
                        {m.emoji}
                      </Text>
                    </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={submitting}
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
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    zIndex: -2,
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
    maxWidth: 350,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  testNote: {
    fontSize: 14,
    marginBottom: 25,
    color: "#E53935",
    fontWeight: "600",
    textAlign: "center",
  },
  moods: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
    marginBottom: 30,
  },
  emoji: {
    fontSize: 40,
    margin: 10,
  },
  selected: {
    borderBottomWidth: 3,
    borderColor: "#16A34A",
    borderRadius: 4,
    transform: [{ scale: 1.2 }],
  },
  submitButton: {
    width: "100%",
    marginTop: 10,
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
