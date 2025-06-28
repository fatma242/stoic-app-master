import BackgroundVideo from "@/components/BackgroundVideo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React from "react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Type definitions
type RoomType = "PUBLIC" | "PRIVATE";
type UserRole = "ADMIN" | "REG";

interface RoomDTO {
  roomId: number;
  ownerId: number;
  roomName: string;
  type: RoomType;
  createdAt: string;
}

export default function Community() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const API_BASE_URL = "http://192.168.1.6:8100";

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (!storedUserId) {
          router.replace("/login");
          return;
        }

        setUserId(parseInt(storedUserId));

        // Fetch user role from API
        const response = await fetch(
          `${API_BASE_URL}/api/users/${storedUserId}`,
          {
            credentials: "include",
          }
        );
        const userData = await response.json();
        setUserRole(userData.userRole);

        // Fetch visible rooms
        await fetchVisibleRooms();
      } catch (error) {
        Alert.alert("Error", "Failed to load user data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const fetchVisibleRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/visible`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch rooms");

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not load rooms"
      );
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert("Error", "Room name is required");
      return;
    }

    setIsCreating(true);
    try {
      const endpoint =
        userRole === "ADMIN"
          ? `${API_BASE_URL}/rooms`
          : `${API_BASE_URL}/rooms/createPR`;

      // Create a complete room object
      const roomData = {
        roomName,
        ownerId: userId,
        type: userRole === "ADMIN" ? "PUBLIC" : "PRIVATE",
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData), // Send full object
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Room creation failed: ${response.status} ${errorText}`
        );
      }

      const newRoom = await response.json();
      setRooms((prev) => [...prev, newRoom]);
      setShowModal(false);
      setRoomName("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not create room"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleRoomPress = (roomId: number) => {
    router.push({
      pathname: "../room",
      params: { id: roomId.toString() },
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#16A34A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackgroundVideo />
      <View style={styles.overlay} />

      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.greeting}>
            {userRole === "ADMIN" ? "Admin Community" : "Your Private Rooms"}
          </Text>

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.createButtonText}>
              {userRole === "ADMIN"
                ? "Create Public Room"
                : "Create Private Room"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.roomsSection}>
          <Text style={styles.sectionTitle}>
            {userRole === "ADMIN" ? "Public Rooms" : "Your Rooms"}
          </Text>

          {rooms.length === 0 ? (
            <Text style={styles.emptyText}>No rooms available</Text>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={room.roomId}
                style={styles.roomItem}
                onPress={() => handleRoomPress(room.roomId)}
              >
                <Text style={styles.roomName}>{room.roomName}</Text>
                <Text style={styles.roomDetails}>
                  {room.type === "PUBLIC" ? "Public" : "Private"} •
                  {room.ownerId === userId
                    ? " Your Room"
                    : ` Owner: ${room.ownerId}`}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Create Room Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {userRole === "ADMIN"
                ? "Create Public Room"
                : "Create Private Room"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Room name"
              value={roomName}
              onChangeText={setRoomName}
              placeholderTextColor="#888"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalCreateButton]}
                onPress={createRoom}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  content: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 15,
  },
  greeting: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "600",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16A34A",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  createButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "600",
    fontSize: 16,
  },
  roomsSection: {
    borderRadius: 15,
    padding: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  sectionTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 15,
  },
  roomItem: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  roomName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 5,
  },
  roomDetails: {
    color: "#ffffffaa",
    fontSize: 14,
  },
  emptyText: {
    color: "#ffffff88",
    textAlign: "center",
    fontSize: 16,
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1e293b",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#64748b",
  },
  modalCreateButton: {
    backgroundColor: "#16A34A",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
