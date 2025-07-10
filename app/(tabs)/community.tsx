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
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect } from "@react-navigation/native";
import i18n from "../../constants/i18n";
import { HeaderWithNotifications } from "../../components/HeaderWithNotifications";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

interface RoomCardProps {
  room: RoomDTO;
  isOwner: boolean;
  showPublicBadge?: boolean;
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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const isRTL = i18n.locale.startsWith("ar");
  const textStyle = {
    textAlign: isRTL ? ("right" as "right") : ("left" as "left"),
  };
  const flexDirection = isRTL ? "row-reverse" : "row";

  // Animation effect
  useEffect(() => {
    if (!loading) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [loading]);

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
            Alert.alert(
                i18n.t("common.error"),
                i18n.t("community.errorFetching")
            );
          } finally {
            setLoading(false);
          }
        };

        loadUserData();
        [];
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorFetching")
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorFetching")
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorFetching")
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
            `${i18n.t("community.errorCreating")}: ${
                response.status
            } ${errorText}`
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorCreating")
      );
    } finally {
      setIsCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!joinCode.trim()) {
      Alert.alert(
          i18n.t("community.errorJoining"),
          i18n.t("community.joinCodeRequired")
      );
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorJoining")
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
          error instanceof Error
              ? error.message
              : i18n.t("community.errorDeleting")
      );
    }
  };

  const leaveRoom = async (roomId: number) => {
    try {
      const response = await fetch(
          `${API_BASE_URL}/rooms/leave-room/${roomId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
      );
      console.log("Leaving room:", roomId, response);
      if (!response.ok) {
        throw new Error(i18n.t("community.errorLeaving"));
      }

      // Remove room from both owner and non-owner rooms
      setOwnerRooms(ownerRooms.filter((room) => room.roomId !== roomId));
      setNonOwnerRooms(nonOwnerRooms.filter((room) => room.roomId !== roomId));
      Alert.alert(i18n.t("community.successLeave"));
    } catch (error) {
      Alert.alert(
          i18n.t("common.error"),
          error instanceof Error
              ? error.message
              : i18n.t("community.errorLeaving")
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

  const showRoomOptions = (roomId: number, isOwner: boolean) => {
    if (isOwner) {
      // Owner can either delete or leave
      Alert.alert(
          i18n.t("community.roomOptionsTitle"),
          i18n.t("community.roomOptionsMessage"),
          [
            {
              text: i18n.t("community.cancel"),
              style: "cancel",
            },

            {
              text: i18n.t("community.delete"),
              onPress: () => confirmDelete(roomId),
              style: "destructive",
            },
          ]
      );
    } else {
      // Non-owner can only leave
      confirmLeaveRoom(roomId);
    }
  };

  const confirmLeaveRoom = (roomId: number) => {
    Alert.alert(
        i18n.t("community.leaveRoomTitle"),
        i18n.t("community.leaveRoomMessage"),
        [
          {
            text: i18n.t("community.cancel"),
            style: "cancel",
          },
          {
            text: i18n.t("community.leave"),
            onPress: () => leaveRoom(roomId),
            style: "destructive",
          },
        ]
    );
  };

  const RoomCard: React.FC<RoomCardProps> = ({ room, isOwner, showPublicBadge = false }) => (
      <Animated.View
          style={[
            styles.roomCard,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
      >
        <TouchableOpacity
            style={[styles.roomCardContent, { flexDirection }]}
            onPress={() => handleRoomPress(room.roomId)}
            onLongPress={() => showRoomOptions(room.roomId, isOwner)}
            activeOpacity={0.7}
        >
          <View style={styles.roomIcon}>
            <Ionicons
                name={room.type === "PUBLIC" ? "globe-outline" : "lock-closed-outline"}
                size={24}
                color="#6366F1"
            />
          </View>

          <View style={styles.roomInfo}>
            <Text style={[styles.roomName, textStyle]} numberOfLines={1}>
              {room.roomName}
            </Text>
            <View style={[styles.roomMeta, { flexDirection }]}>
              {showPublicBadge && (
                  <View style={styles.publicBadge}>
                    <Text style={styles.publicBadgeText}>Public</Text>
                  </View>
              )}
              <Text style={[styles.roomDate, textStyle]}>
                {new Date(room.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.roomActions}>
            <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={20}
                color="#9CA3AF"
            />
          </View>
        </TouchableOpacity>
      </Animated.View>
  );

  if (loading) {
    return (
        <View style={[styles.container, styles.center]}>
          <BackgroundVideo />
          <LinearGradient
              colors={["rgba(0,0,0,0.9)", "rgba(0,0,0,0.7)"]}
              style={styles.gradient}
          />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Loading Community...</Text>
          </View>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <BackgroundVideo />

        {/* Modern gradient overlay */}
        <LinearGradient
            colors={[
              "rgba(0,0,0,0.9)",
              "rgba(0,0,0,0.7)",
              "rgba(0,0,0,0.5)",
              "rgba(0,0,0,0.8)"
            ]}
            locations={[0, 0.3, 0.7, 1]}
            style={styles.gradient}
        />

        {/* Header */}
        <View>
          <HeaderWithNotifications isRTL={isRTL} style={styles.header} />
          <Animated.View
              style={[
                styles.titleContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
          >
            <Text style={[styles.headerTitle, textStyle]}>
              {userRole === "ADMIN"
                  ? i18n.t("community.titleAdmin")
                  : i18n.t("community.titleUser")}
            </Text>
            <Text style={[styles.headerSubtitle, textStyle]}>
              Connect, create, and collaborate
            </Text>
          </Animated.View>
        </View>

        <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
        >
          {/* Action Cards */}
          <Animated.View
              style={[
                styles.actionCardsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
          >
            <TouchableOpacity
                style={[styles.actionCard, styles.createCard]}
                onPress={() => setShowModal(true)}
                activeOpacity={0.8}
            >
              <LinearGradient
                  colors={["#6366F1", "#8B5CF6"]}
                  style={styles.actionCardGradient}
              >
                <View style={styles.actionCardIcon}>
                  <Ionicons name="add-circle-outline" size={28} color="white" />
                </View>
                <Text style={styles.actionCardTitle}>
                  {userRole === "ADMIN"
                      ? i18n.t("community.createPublicRoom")
                      : i18n.t("community.createPrivateRoom")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.actionCard, styles.joinCard]}
                onPress={() => setShowJoinModal(true)}
                activeOpacity={0.8}
            >
              <LinearGradient
                  colors={["#10B981", "#059669"]}
                  style={styles.actionCardGradient}
              >
                <View style={styles.actionCardIcon}>
                  <Ionicons name="log-in-outline" size={28} color="white" />
                </View>
                <Text style={styles.actionCardTitle}>
                  {i18n.t("community.joinRoomButton")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Rooms Sections */}
          <Animated.View
              style={[
                styles.roomsContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
          >
            {/* Rooms You Own */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionHeader, { flexDirection }]}>
                <Text style={[styles.sectionTitle, textStyle]}>
                  {i18n.t("community.roomsOwned")}
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{ownerRooms.length}</Text>
                </View>
              </View>

              {ownerRooms.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="home-outline" size={48} color="#6B7280" />
                    <Text style={[styles.emptyText, textStyle]}>
                      {i18n.t("community.noRoomsOwned")}
                    </Text>
                    <Text style={[styles.emptySubtext, textStyle]}>
                      Create your first room to get started
                    </Text>
                  </View>
              ) : (
                  ownerRooms.map((room) => (
                      <RoomCard key={room.roomId} room={room} isOwner={true} />
                  ))
              )}
            </View>

            {/* Joined Rooms */}
            <View style={styles.sectionContainer}>
              <View style={[styles.sectionHeader, { flexDirection }]}>
                <Text style={[styles.sectionTitle, textStyle]}>
                  {i18n.t("community.joinedRooms")}
                </Text>
                <View style={styles.sectionBadge}>
                  <Text style={styles.sectionBadgeText}>{nonOwnerRooms.length}</Text>
                </View>
              </View>

              {nonOwnerRooms.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="people-outline" size={48} color="#6B7280" />
                    <Text style={[styles.emptyText, textStyle]}>
                      {i18n.t("community.noJoinedRooms")}
                    </Text>
                    <Text style={[styles.emptySubtext, textStyle]}>
                      Join rooms to connect with others
                    </Text>
                  </View>
              ) : (
                  nonOwnerRooms.map((room) => (
                      <RoomCard key={room.roomId} room={room} isOwner={false} />
                  ))
              )}
            </View>

            {/* Public Rooms (for non-admin users) */}
            {userRole !== "ADMIN" && (
                <View style={styles.sectionContainer}>
                  <View style={[styles.sectionHeader, { flexDirection }]}>
                    <Text style={[styles.sectionTitle, textStyle]}>
                      {i18n.t("community.publicRooms")}
                    </Text>
                    <View style={styles.sectionBadge}>
                      <Text style={styles.sectionBadgeText}>{filteredPublicRooms.length}</Text>
                    </View>
                  </View>

                  {filteredPublicRooms.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Ionicons name="globe-outline" size={48} color="#6B7280" />
                        <Text style={[styles.emptyText, textStyle]}>
                          {i18n.t("community.noPublicRooms")}
                        </Text>
                        <Text style={[styles.emptySubtext, textStyle]}>
                          No public rooms available right now
                        </Text>
                      </View>
                  ) : (
                      filteredPublicRooms.map((room) => (
                          <RoomCard key={room.roomId} room={room} isOwner={false} showPublicBadge={true} />
                      ))
                  )}
                </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Modern Create Room Modal */}
        <Modal
            visible={showModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} style={styles.modalBlur}>
              <View style={styles.modalContainer}>
                <View style={styles.modernModal}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, textStyle]}>
                      {userRole === "ADMIN"
                          ? i18n.t("community.createPublicRoom")
                          : i18n.t("community.createPrivateRoom")}
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <Text style={[styles.inputLabel, textStyle]}>Room Name</Text>
                    <TextInput
                        style={[styles.modernInput, textStyle]}
                        placeholder={i18n.t("community.roomNamePlaceholder")}
                        placeholderTextColor="#6B7280"
                        value={roomName}
                        onChangeText={setRoomName}
                    />
                  </View>

                  <View style={[styles.modalActions, { flexDirection }]}>
                    <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setShowModal(false)}
                    >
                      <Text style={styles.modalCancelText}>
                        {i18n.t("community.cancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalCreateButton}
                        onPress={createRoom}
                        disabled={isCreating}
                    >
                      <LinearGradient
                          colors={["#6366F1", "#8B5CF6"]}
                          style={styles.modalCreateGradient}
                      >
                        {isCreating ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.modalCreateText}>
                              {i18n.t("community.create")}
                            </Text>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>

        {/* Modern Join Room Modal */}
        <Modal
            visible={showJoinModal}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setShowJoinModal(false)}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} style={styles.modalBlur}>
              <View style={styles.modalContainer}>
                <View style={styles.modernModal}>
                  <View style={styles.modalHeader}>
                    <Text style={[styles.modalTitle, textStyle]}>
                      {i18n.t("community.joinRoomButton")}
                    </Text>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowJoinModal(false)}
                    >
                      <Ionicons name="close" size={24} color="#6B7280" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <Text style={[styles.inputLabel, textStyle]}>Join Code</Text>
                    <TextInput
                        style={[styles.modernInput, textStyle]}
                        placeholder={i18n.t("community.joinRoomPlaceholder")}
                        placeholderTextColor="#6B7280"
                        value={joinCode}
                        onChangeText={setJoinCode}
                    />
                  </View>

                  <View style={[styles.modalActions, { flexDirection }]}>
                    <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setShowJoinModal(false)}
                    >
                      <Text style={styles.modalCancelText}>
                        {i18n.t("community.cancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.modalCreateButton}
                        onPress={joinRoom}
                    >
                      <LinearGradient
                          colors={["#10B981", "#059669"]}
                          style={styles.modalCreateGradient}
                      >
                        <Text style={styles.modalCreateText}>
                          {i18n.t("community.joinRoomButton")}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </BlurView>
          </View>
        </Modal>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
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
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,

  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "400",
    marginTop: 4,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  actionCardsContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    height: 120,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createCard: {
    // Additional styles for create card if needed
  },
  joinCard: {
    // Additional styles for join card if needed
  },
  actionCardGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  actionCardIcon: {
    marginBottom: 8,
  },

  actionCardTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  roomsContainer: {
    gap: 24,
  },
  sectionContainer: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  sectionBadge: {
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(99, 102, 241, 0.3)",
  },
  sectionBadgeText: {
    color: "#6366F1",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 12,
  },
  emptySubtext: {
    color: "#6B7280",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  roomCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  roomCardContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  roomIcon: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  roomMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  roomDate: {
    color: "#9CA3AF",
    fontSize: 12,
    fontWeight: "400",
  },
  publicBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  publicBadgeText: {
    color: "#10B981",
    fontSize: 10,
    fontWeight: "500",
  },
  roomActions: {
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBlur: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  modernModal: {
    backgroundColor: "rgba(30, 30, 30, 0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  modernInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    paddingTop: 0,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelText: {
    color: "#9CA3AF",
    fontSize: 16,
    fontWeight: "500",
  },
  modalCreateButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  modalCreateGradient: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCreateText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});