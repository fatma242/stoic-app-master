import BackgroundVideo from "@/components/BackgroundVideo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Video } from "expo-av";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const ProgressScreen = () => {
  const [moodData, setMoodData] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) throw new Error("User not found. Please log in again.");

        const response = await axios.get(
          `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/mood-logs/${userId}`
        );
        setMoodData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch mood data");
        setLoading(false);
      }
    };

    fetchMoodData();

    if (videoRef.current) videoRef.current.playAsync();
    return () => {
      if (videoRef.current) videoRef.current.pauseAsync();
    };
  }, []);

  const formatChartLabels = (logs: MoodLog[]) => {
    const formattedLabels: string[] = [];
    logs.forEach((log, index) => {
      const currentDate = new Date(log.timestamp);
      const previousDate = index > 0 ? new Date(logs[index - 1].timestamp) : null;
      if (
        previousDate &&
        currentDate.getDate() === previousDate.getDate() &&
        currentDate.getMonth() === previousDate.getMonth() &&
        currentDate.getFullYear() === previousDate.getFullYear()
      ) {
        formattedLabels.push(moment(log.timestamp).format("HH:mm"));
      } else {
        formattedLabels.push(moment(log.timestamp).format("DD/MM"));
      }
    });
    return formattedLabels;
  };

  const calculateStreak = (logs: MoodLog[]): number => {
    if (!logs.length) return 0;

    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    let streak = 0;
    let currentWeek = moment().startOf("isoWeek");

    const weeksSet = new Set(
      sortedLogs.map((log) => moment(log.timestamp).startOf("isoWeek").format("YYYY-MM-DD"))
    );

    while (weeksSet.has(currentWeek.format("YYYY-MM-DD"))) {
      streak++;
      currentWeek = currentWeek.subtract(1, "week");
    }

    return streak;
  };

  const streak = calculateStreak(moodData);
  const chartData = {
    labels: moodData.length ? formatChartLabels(moodData) : ["No Data"],
    datasets: [
      {
        data: moodData.length ? moodData.map((item) => item.moodScore) : [0],
      },
    ],
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <VideoBackground videoRef={videoRef} />
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <VideoBackground videoRef={videoRef} />
        <View style={styles.overlay}>
          <Text style={{ color: "red" }}>{error}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VideoBackground videoRef={videoRef} />
      <View style={styles.overlay}>
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.title}>Your Mental Health Journey 🌱</Text>

          {/* Streak Card */}
          <LinearGradient colors={['#16A34A', '#0d4215']} style={styles.card}>
            <Text style={styles.cardTitle}>
              Day Mindfulness Streak! 🔥
            </Text>
            <Text style={styles.cardText}>
              Keep logging your mood weekly to grow your streak
            </Text>
            <View style={styles.progressContainer}>
              <Ionicons name="flame" size={40} color="#FFD700" />
              <Text style={styles.streakNumber}>{streak}</Text>
            </View>
          </LinearGradient>

          {/* Mood Trends */}
          <LinearGradient colors={['#16A34A20', '#0d421520']} style={styles.card}>
            <Text style={styles.cardTitle}>Mood Trends</Text>
            <View style={styles.chartPlaceholder}>
              <Ionicons name="stats-chart" size={50} color="#16A34A" />
              <Text style={styles.chartText}>Mood Progress (Last week)</Text>
            </View>
            {moodData.length === 0 ? (
              <Text style={styles.noDataText}>
                You haven't submitted any check-ins yet.
              </Text>
            ) : null}
            <LineChart
              data={chartData}
              width={Dimensions.get("window").width - 48}
              height={200}
              chartConfig={{
                backgroundGradientFrom: "#e6f4ea",
                backgroundGradientTo: "#d1f7de",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(22, 101, 52, ${opacity})`,
                propsForDots: {
                  r: "5",
                  strokeWidth: "2",
                  stroke: "#16A34A",
                },
              }}
              style={{ marginVertical: 10, borderRadius: 16 }}
              bezier
              fromZero
            />
          </LinearGradient>
        </ScrollView>
      </View>
    </View>
  );
};

const VideoBackground = ({ videoRef }: { videoRef: React.RefObject<Video> }) => (
  <BackgroundVideo />
);

// Interface
interface MoodLog {
  id: number;
  userId: string;
  moodScore: number;
  timestamp: string;
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  scrollContainer: {
    flex: 1,
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 20,
    color: "white",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noDataText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    marginRight: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    color: "#e4fbe6",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFD700",
    marginLeft: 8,
  },
  chartPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  chartText: {
    fontSize: 14,
    color: "#fff",
    marginTop: 8,
  },
});

export default ProgressScreen;
