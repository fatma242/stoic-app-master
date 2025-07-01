import BackgroundVideo from "@/components/BackgroundVideo";
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "../../constants/i18n";

// Type definitions
type RoomType = "PUBLIC" | "PRIVATE";
type UserRole = "ADMIN" | "REG";

interface RoomDTO {
  roomId: number;
  ownerId: number;
  roomName: string;
  type: RoomType;
  createdAt: string;
  joinCode?: string;
}

export default function Community() {
  const router = useRouter();
  const [publicRooms, setPublicRooms] = useState<RoomDTO[]>([]);
  const [ownerRooms, setOwnerRooms] = useState<RoomDTO[]>([]);
  const [nonOwnerRooms, setNonOwnerRooms] = useState<RoomDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false); 

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const isRTL = i18n.locale.startsWith("ar");
  const textStyle = { textAlign: isRTL ? "right" as "right" : "left" as "left" };
  const flexDirection = isRTL ? "row-reverse" : "row";

  useFocusEffect(
    React.useCallback(() => {
      const loadUserData = async () => {
        try {
          const storedUserId = await AsyncStorage.getItem("userId");
          if (!storedUserId) {
            router.replace("/login");
            return;
          }
          setUserId(parseInt(storedUserId));
          console.log("Stored user ID:", storedUserId);
          // Fetch user role from API
          const response = await fetch(
            `${API_BASE_URL}/api/users/${storedUserId}`,
            {
              credentials: "include",
            }
          );
          if (!response.ok) {
            console.error("Failed to fetch user data:", response.status);
            throw new Error("Failed to fetch user data");
          }
          const userData = await response.json();
          setUserRole(userData.userRole);

          await fetchOwnerRooms();
          await fetchNonOwnerRooms();
          if (userData.userRole !== "ADMIN") {
            await fetchPublicRooms();
          }
        } catch (error) {
          console.error("Error loading user data:", error);
          Alert.alert("Error", "Failed to load user data");
          Alert.alert(i18n.t("common.error"), i18n.t("community.errorFetching"));
        } finally {
          setLoading(false);
        }
      };

      loadUserData();[]
    }, [])
  );

  const fetchPublicRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/getPub`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(i18n.t("community.errorFetching"));
      const data = await response.json();
      setPublicRooms(data);
    } catch (error) {
      Alert.alert(
        i18n.t("common.error"),
        error instanceof Error ? error.message : i18n.t("community.errorFetching")
      );
    }
  };

  const filteredPublicRooms = publicRooms.filter(
    (room) =>
      room.ownerId !== userId &&
      !nonOwnerRooms.some((r) => r.roomId === room.roomId) &&
      !ownerRooms.some((r) => r.roomId === room.roomId)
  );

  const fetchOwnerRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/visible/owner`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(i18n.t("community.errorFetching"));

      const data = await response.json();
      setOwnerRooms(data);
    } catch (error) {
      Alert.alert(
        i18n.t("common.error"),
        error instanceof Error ? error.message : i18n.t("community.errorFetching")
      );
    }
  };

  const fetchNonOwnerRooms = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/visible`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(i18n.t("community.errorFetching"));

      const data = await response.json();
      setNonOwnerRooms(data);
    } catch (error) {
      Alert.alert(
        i18n.t("common.error"),
        error instanceof Error ? error.message : i18n.t("community.errorFetching")
      );
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert(i18n.t("common.error"), i18n.t("community.roomNameRequired"));
      return;
    }

    setIsCreating(true);
    try {
      const endpoint =
        userRole === "ADMIN"
          ? `${API_BASE_URL}/rooms`
          : `${API_BASE_URL}/rooms/createPR/${userId}`;

      const roomData = {
        roomName,
        ownerId: userId,
        type: userRole === "ADMIN" ? "PUBLIC" : "PRIVATE",
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${i18n.t("community.errorCreating")}: ${response.status} ${errorText}`
        );
      }

      const newRoom = await response.json();
      setOwnerRooms((prev) => [...prev, newRoom]);
      setShowModal(false);
      setRoomName("");
      Alert.alert(i18n.t("community.successCreate"));
    } catch (error) {
      Alert.alert(
        i18n.t("community.errorCreating"),
        error instanceof Error ? error.message : i18n.t("community.errorCreating")
      );
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      Alert.alert(i18n.t("community.errorJoining"), i18n.t("community.joinCodeRequired"));
      return;
    }
    try {
      const response = await fetch(
        `${API_BASE_URL}/rooms/joinPR?joinCode=${joinCode}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `${i18n.t("community.errorJoining")}: ${response.status} ${errorText}`
        );
      }
      Alert.alert(i18n.t("community.successJoin"));
      await fetchOwnerRooms();
      await fetchNonOwnerRooms();
      setJoinCode("");
      setShowJoinModal(false);
    } catch (error) {
      Alert.alert(
        i18n.t("common.error"),
        error instanceof Error ? error.message : i18n.t("community.errorJoining")
      );
    }
  };

  const deleteRoom = async (roomId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(i18n.t("community.errorDeleting"));
      }

      setOwnerRooms(ownerRooms.filter((room) => room.roomId !== roomId));
      Alert.alert(i18n.t("community.successDelete"));
    } catch (error) {
      Alert.alert(
        error instanceof Error ? error.message : i18n.t("community.errorDeleting")
      );
    }
  };

  const handleRoomPress = (roomId: number) => {
    router.push({
      pathname: "../room",
      params: { id: roomId.toString() },
    });
  };

  const confirmDelete = (roomId: number) => {
    Alert.alert(
      i18n.t("community.deleteRoomTitle"),
      i18n.t("community.deleteRoomMessage"),
      [
        {
          text: i18n.t("community.cancel"),
          style: "cancel",
        },
        {
          text: i18n.t("community.delete"),
          onPress: () => deleteRoom(roomId),
          style: "destructive",
        },
      ]
    );
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
      <LinearGradient
        colors={["rgba(0,0,0,0.8)", "transparent"]}
        style={styles.gradient}
      />

      {/* Header */}
      <View style={[styles.header, { flexDirection }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name={isRTL ? "arrow-forward" : "arrow-back"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, textStyle]}>
          {userRole === "ADMIN"
            ? i18n.t("community.titleAdmin")
            : i18n.t("community.titleUser")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Create Room Button */}
        <View style={[styles.buttonRow, { flexDirection }]}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.buttonText}>
              {userRole === "ADMIN"
                ? i18n.t("community.createPublicRoom")
                : i18n.t("community.createPrivateRoom")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => setShowJoinModal(true)}
          >
            <Text style={styles.buttonText}>
              {i18n.t("community.joinRoomButton")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rooms You Own */}
        <Text style={[styles.sectionTitle, textStyle]}>
          {i18n.t("community.roomsOwned")}
        </Text>
        {ownerRooms.length === 0 ? (
          <Text style={[styles.emptyText, textStyle]}>
            {i18n.t("community.noRoomsOwned")}
          </Text>
        ) : (
          ownerRooms.map((room) => (
            <TouchableOpacity
              key={room.roomId}
              style={[styles.roomContainer, { flexDirection }]}
              onPress={() => handleRoomPress(room.roomId)}
              onLongPress={() => confirmDelete(room.roomId)}
            >
              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, textStyle]}>
                  {room.roomName}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "arrow-back" : "arrow-forward"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          ))
        )}

        {/* Joined Rooms */}
        <Text style={[styles.sectionTitle, textStyle]}>
          {i18n.t("community.joinedRooms")}
        </Text>
        {nonOwnerRooms.length === 0 ? (
          <Text style={[styles.emptyText, textStyle]}>
            {i18n.t("community.noJoinedRooms")}
          </Text>
        ) : (
          nonOwnerRooms.map((room) => (
            <TouchableOpacity
              key={room.roomId}
              style={[styles.roomContainer, { flexDirection }]}
              onPress={() => handleRoomPress(room.roomId)}
            >
              <View style={styles.roomInfo}>
                <Text style={[styles.roomName, textStyle]}>
                  {room.roomName}
                </Text>
              </View>
              <Ionicons
                name={isRTL ? "arrow-back" : "arrow-forward"}
                size={20}
                color="white"
              />
            </TouchableOpacity>
          ))
        )}

        {/* Public Rooms (for non-admin users) */}
        {userRole !== "ADMIN" && (
          <>
            <Text style={[styles.sectionTitle, textStyle]}>
              {i18n.t("community.publicRooms")}
            </Text>
            {filteredPublicRooms.length === 0 ? (
              <Text style={[styles.emptyText, textStyle]}>
                {i18n.t("community.noPublicRooms")}
              </Text>
            ) : (
              filteredPublicRooms.map((room) => (
                <TouchableOpacity
                  key={room.roomId}
                  style={[styles.roomContainer, { flexDirection }]}
                  onPress={() => handleRoomPress(room.roomId)}
                >
                  <View style={styles.roomInfo}>
                    <Text style={[styles.roomName, textStyle]}>
                      {room.roomName}
                    </Text>
                  </View>
                  <Ionicons
                    name={isRTL ? "arrow-back" : "arrow-forward"}
                    size={20}
                    color="white"
                  />
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Create Room Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, textStyle]}>
              {userRole === "ADMIN"
                ? i18n.t("community.createPublicRoom")
                : i18n.t("community.createPrivateRoom")}
            </Text>
            <TextInput
              style={[styles.input, textStyle]}
              placeholder={i18n.t("community.roomNamePlaceholder")}
              placeholderTextColor="#999"
              value={roomName}
              onChangeText={setRoomName}
            />
            <View style={[styles.modalButtons, { flexDirection }]}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>
                  {i18n.t("community.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createModalButton}
                onPress={createRoom}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>
                    {i18n.t("community.create")}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Join Room Modal */}
      <Modal
        visible={showJoinModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowJoinModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalTitle, textStyle]}>
              {i18n.t("community.joinRoomButton")}
            </Text>
            <TextInput
              style={[styles.input, textStyle]}
              placeholder={i18n.t("community.joinRoomPlaceholder")}
              placeholderTextColor="#999"
              value={joinCode}
              onChangeText={setJoinCode}
            />
            <View style={[styles.modalButtons, { flexDirection }]}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowJoinModal(false)}
              >
                <Text style={styles.buttonText}>
                  {i18n.t("community.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createModalButton}
                onPress={joinRoom}
              >
                <Text style={styles.buttonText}>
                  {i18n.t("community.joinRoomButton")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "100%",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Constants.statusBarHeight + 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  createButton: {
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  joinButton: {
    backgroundColor: "#3B82F6",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    color: "#999",
    textAlign: "center",
    marginVertical: 20,
  },
  roomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  roomType: {
    color: "#888",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1e1e1e",
    width: "80%",
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
  },
  createModalButton: {
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
  },
});