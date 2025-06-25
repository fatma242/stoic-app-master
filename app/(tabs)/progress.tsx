import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import moment from "moment"; // Add moment for date formatting

const ProgressScreen = () => {
  const [moodData, setMoodData] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const videoRef = useRef<Video>(null);

  useEffect(() => {
    const fetchMoodData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("User not found. Please log in again.");
        }

        const response = await axios.get(
          `http://192.168.1.2:8100/api/mood-logs/${userId}`
        );
        setMoodData(response.data);
        setLoading(false);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch mood data");
        }
        setLoading(false);
      }
    };

    fetchMoodData();

    if (videoRef.current) {
      videoRef.current.playAsync();
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.pauseAsync();
      }
    };
  }, []);

  // Format dates intelligently to avoid duplicates and show time when needed
  const formatChartLabels = (logs: MoodLog[]) => {
    const formattedLabels: string[] = [];

    logs.forEach((log, index) => {
      const currentDate = new Date(log.timestamp);
      const previousDate =
        index > 0 ? new Date(logs[index - 1].timestamp) : null;

      // If previous entry exists and is on the same day, show time
      if (
        previousDate &&
        currentDate.getDate() === previousDate.getDate() &&
        currentDate.getMonth() === previousDate.getMonth() &&
        currentDate.getFullYear() === previousDate.getFullYear()
      ) {
        formattedLabels.push(moment(log.timestamp).format("HH:mm"));
      }
      // Otherwise show date only
      else {
        formattedLabels.push(moment(log.timestamp).format("DD/MM"));
      }
    });

    return formattedLabels;
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

  if (moodData.length === 0) {
    return (
      <View style={styles.container}>
        <VideoBackground videoRef={videoRef} />
        <View style={styles.overlay}>
          <Text style={styles.noDataText}>No mood data available</Text>
        </View>
      </View>
    );
  }

  // Use our intelligent formatting function
  const chartData = {
    labels: formatChartLabels(moodData),
    datasets: [
      {
        data: moodData.map((item) => item.moodScore),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <VideoBackground videoRef={videoRef} />
      <View style={styles.overlay}>
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.title}>Mood Progress</Text>
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 32}
            height={220}
            chartConfig={{
              backgroundColor: "rgba(255,255,255,0.3)",
              backgroundGradientFrom: "rgba(201, 245, 216, 0.8)",
              backgroundGradientTo: "rgba(131, 231, 173, 0.8)",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
              propsForLabels: {
                fontWeight: "bold",
                fontSize: 10, // Smaller font for better fit
              },
              propsForDots: {
                r: "4", // Smaller dots for dense data
                strokeWidth: "1",
                stroke: "#166534",
              },
            }}
            style={{ marginVertical: 20, borderRadius: 16 }}
            bezier
            fromZero
            yAxisInterval={1}
            segments={4}
          />
        </ScrollView>
      </View>
    </View>
  );
};

// Video Background Component
const VideoBackground = ({
  videoRef,
}: {
  videoRef: React.RefObject<Video>;
}) => (
  <Video
    ref={videoRef}
    source={require("../../assets/background.mp4")} // Update with your video path
    style={StyleSheet.absoluteFill}
    resizeMode="cover"
    shouldPlay
    isLooping
    isMuted
    rate={1.0}
  />
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-dark overlay
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
    color: "white",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  noDataText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
  },
});

interface MoodLog {
  id: number;
  userId: string;
  moodScore: number;
  timestamp: string;
}

export default ProgressScreen;
