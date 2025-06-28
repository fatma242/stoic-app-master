import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Video, ResizeMode } from 'expo-av';
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Type definitions
interface User {
  userId: number;
  username: string;
  email: string;
}

interface Room {
  roomId: number;
  ownerId: number;
  roomName: string;
  join_code: string;
  type: "PUBLIC" | "PRIVATE";
  createdAt: string;
}

interface Message {
  id: number;
  content: string;
  senderId: number;
  senderName: string;
  timestamp: string;
}

interface Post {
  id: number;
  title: string;
  content: string;
  author?: {
    userId: number;
    username: string;
  };
  date: string;
  likes: number;
  isLikedByUser?: boolean;
}

interface Notification {
  id: number;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const roomId = id ? parseInt(id as string) : null;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Room management
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Users in the room
  const [roomUsers, setRoomUsers] = useState<User[]>([]);

  // Add this after your existing state declarations
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set());
  const [refreshCount, setRefreshCount] = useState(0);

  const stompClient = useRef<any>(null);
  const API_BASE_URL = "http://192.168.1.8:8100";

  const scrollViewRef = useRef<ScrollView>(null);

  const connectWebSocket = () => {
    const socket = new SockJS(`${API_BASE_URL}/ws-chat`);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        stompClient.current.subscribe(
            `/topic/rooms/${roomId}`,
            (message: any) => {
              const newMessage = JSON.parse(message.body);
              setMessages((prev) => [...prev, newMessage]);
              scrollToBottom();
            }
        );

        // Subscribe to notifications
        stompClient.current.subscribe(
            `/user/${userId}/queue/notifications`,
            (message: any) => {
              const notification = JSON.parse(message.body);
              setNotifications((prev) => [notification, ...prev]);
              setUnreadCount((prev) => prev + 1);
            }
        );
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
    });

    stompClient.current.activate();
  };

  const fetchRoom = async (currentUserId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch room");

      const data: Room = await response.json();
      console.log("Fetched room:", data);
      setRoom(data);
      setEditedName(data.roomName);

      // Calculate owner status immediately with the current userId
      const ownerStatus = currentUserId === data.ownerId;
      setIsOwner(ownerStatus);
      console.log(
          "Owner check: userId",
          currentUserId,
          "room.ownerId",
          data.ownerId,
          "isOwner:",
          ownerStatus
      );

      // Optional: Fetch owner details if needed
      try {
        const response2 = await fetch(
            `${API_BASE_URL}/api/users/${data.ownerId}`,
            {
              credentials: "include",
            }
        );
        const ownerData: User = await response2.json();
        console.log("Fetched room owner:", ownerData.userId);
      } catch (error) {
        console.log("Could not fetch owner details:", error);
      }
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Could not load room"
      );
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(
          `${API_BASE_URL}/api/messages/rooms/${roomId}/history`,
          {
            credentials: "include",
          }
      );

      if (!response.ok) throw new Error("Failed to fetch messages");

      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Could not load messages"
      );
    }
  };

  const fetchPosts = async (currentUserIdParam?: number) => {
    const uid = currentUserIdParam ?? userId;
    if (!roomId || uid === null) return;

    try {
      const response = await fetch(
          `${API_BASE_URL}/rooms/posts/room/${roomId}`,
          { credentials: "include" }
      );
      if (response.status === 204) {
        setPosts([]);
        return;
      }
      if (!response.ok) throw new Error("Failed to fetch posts");

      const data: Post[] = await response.json();
      const processed: Post[] = data.map((post) => {
        const likesArray = Array.isArray((post as any).likes)
            ? ((post as any).likes as User[])
            : [];
        const likesCount = likesArray.length;
        const likedByMe = likesArray.some((u) => u.userId === uid);

        return {
          ...post,
          likes: likesCount,
          isLikedByUser: likedByMe,
        };
      });

      setPosts(processed);
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Could not load posts"
      );
    }
  };

  const fetchNotifications = async (currentUserId: number) => {
    try {
      const response = await fetch(
          `${API_BASE_URL}/api/notifications?userId=${currentUserId}`,
          {
            credentials: "include",
          }
      );

      if (!response.ok) throw new Error("Failed to fetch notifications");

      const data: Notification[] = await response.json();
      setNotifications(data);

      // Count unread notifications
      const unread = data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Could not load notifications"
      );
    }
  };

  const fetchRoomUsers = async () => {
    if (!roomId) return;
    try {
      console.log("Fetching room users");
      const response = await fetch(`${API_BASE_URL}/users?roomId=${roomId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch room users");

      const data = await response.json();
      console.log("Raw room users response:", data);
      // Extract the array from the HAL response
      const users = data._embedded?.users;
      setRoomUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error(error);
      Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Could not load room users"
      );
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !stompClient.current || !userId || !roomId)
      return;

    setIsSending(true);
    try {
      const messageDto = {
        content: newMessage,
        senderId: userId,
        roomId: roomId,
      };

      stompClient.current.publish({
        destination: `/app/chat.send/${roomId}`,
        body: JSON.stringify(messageDto),
      });

      setNewMessage("");
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Failed to send message"
      );
    } finally {
      setIsSending(false);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert("Error", "Title and content are required");
      return;
    }

    setIsCreatingPost(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/posts/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          title: newPostTitle,
          content: newPostContent,
          roomId: roomId,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
            `Failed to create post: ${response.status} - ${errorText}`
        );
      }

      const newPost = await response.json();
      setPosts((prev) => [...prev, newPost]);
      setNewPostTitle("");
      setNewPostContent("");
      Alert.alert("Success", "Post created successfully");
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Could not create post"
      );
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!room || !editedName.trim()) {
      Alert.alert("Error", "Room name is required");
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...room,
          roomName: editedName,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Update failed");

      const updatedRoom = await response.json();
      setRoom(updatedRoom);
      setIsEditing(false);
      Alert.alert("Success", "Room updated successfully");
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error && error.message
              ? error.message
              : "Could not update room"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!room) return;

    Alert.alert(
        "Confirm Delete",
        `Are you sure you want to delete "${room.roomName}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsDeleting(true);
              try {
                const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
                  method: "DELETE",
                  credentials: "include",
                });

                if (!response.ok) throw new Error("Delete failed");

                Alert.alert("Success", "Room deleted successfully");
                router.back();
              } catch (error) {
                Alert.alert(
                    "Error",
                    error instanceof Error && error.message
                        ? error.message
                        : "Could not delete room"
                );
              } finally {
                setIsDeleting(false);
              }
            },
          },
        ]
    );
  };

  const markNotificationsAsRead = async () => {
    if (!userId) return;
    try {
      await fetch(
          `${API_BASE_URL}/api/notifications/mark-read?userId=${userId}`,
          {
            method: "POST",
            credentials: "include",
          }
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark notifications as read", error);
    }
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const copyRoomCode = async () => {
    if (room?.join_code) {
      await Clipboard.setStringAsync(room.join_code);
      Alert.alert("Copied", "Room code copied to clipboard");
    }
  };

  // Use useFocusEffect to reload data every time the screen is focused
  useFocusEffect(
      useCallback(() => {
        let isActive = true;

        async function loadData() {
          try {
            setLoading(true);

            // First, load user data from AsyncStorage
            const storedUserId = await AsyncStorage.getItem("userId");
            const storedUsername = await AsyncStorage.getItem("username");

            if (!storedUserId) {
              Alert.alert("Error", "User not found. Please log in again.");
              return;
            }

            const parsedUserId = parseInt(storedUserId);
            console.log("Loading user data - userId:", parsedUserId);

            // Set user data immediately
            setUserId(parsedUserId);
            if (storedUsername) {
              setUsername(storedUsername);
            }

            // Only proceed if we have a valid roomId and the component is still active
            if (roomId && isActive) {
              // Fetch room data with the current userId to determine ownership immediately
              await fetchRoom(parsedUserId);
              await fetchMessages();
              // pass the parsedUserId here:
              await fetchPosts(parsedUserId);
              await fetchNotifications(parsedUserId);
              await fetchRoomUsers();

              // Connect WebSocket after all data is loaded
              if (isActive) {
                connectWebSocket();
              }
            }
          } catch (error) {
            console.error("Error loading data:", error);
            Alert.alert("Error", "Failed to load room data");
          } finally {
            if (isActive) {
              setLoading(false);
            }
          }
        }

        loadData();

        // Cleanup function
        return () => {
          isActive = false;
          if (stompClient.current) {
            stompClient.current.deactivate();
          }
        };
      }, [roomId])
  );

  // Add this useEffect after your existing state declarations and before useFocusEffect

  useEffect(() => {
    if (userId !== null && roomId) {
      fetchPosts(userId);
    }
  }, [refreshCount, userId, roomId]);

  const handlePostPress = (postId: number) => {
    router.push({
      pathname: "../post-details",
      params: { postId: postId.toString(), roomId: roomId?.toString() || "" },
    });
  };

  const handleLike = async (postId: number) => {
    if (likingPostIds.has(postId) || userId === null) return;
    // mark this post as pending
    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/likes/${postId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle like");

      // Trigger a refresh of all posts to get updated counts
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
          "Error",
          error instanceof Error ? error.message : "Could not toggle like"
      );
    } finally {
      // clear pending flag
      setLikingPostIds((prev) => {
        const copy = new Set(prev);
        copy.delete(postId);
        return copy;
      });
    }
  };

  const handleRemoveUser = async (username: string) => {
    if (!roomId || !userId) return;

    Alert.alert(
        "Remove User",
        `Are you sure you want to remove ${username} from this room? `,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                console.log("Attempting to remove user:", roomId);
                const response = await fetch(
                    `${API_BASE_URL}/rooms/${roomId}/remove-user/${username}`,
                    {
                      method: "DELETE",
                      credentials: "include",
                    }
                );
                console.log("Removing user:", username);
                console.log("responce:" + response.status);

                if (!response.ok) throw new Error("Failed to remove user");
                else console.log("User removed successfully:", username);
                // Refresh the room users list
                await fetchRoomUsers();
                Alert.alert(
                    "Success",
                    `${username} has been removed from the room`
                );
              } catch (error) {
                Alert.alert(
                    "Error",
                    error instanceof Error ? error.message : "Could not remove user"
                );
              }
            },
          },
        ]
    );
  };

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
    );
  }

  if (!room) {
    return (
        <View style={styles.center}>
          <Text style={styles.errorText}>Room not found</Text>
        </View>
    );
  }
  // Replace line 605-606 with:
  console.log(
      "First post likes count:",
      posts.length > 0 ? posts[0].likes || 0 : 0
  );
  // console.log("Number of posts with likes:", posts.filter(post => post.likes && post.likes.size > 0).length);
  return (
      <View style={styles.container}>
        {/* Video Background */}
        <Video
            source={require("../assets/background.mp4")}
            style={styles.backgroundVideo}
            rate={1.0}
            volume={1.0}
            isMuted
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
        />
        <View style={styles.overlay} />

        {/* Top Bar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Room Details</Text>

          <View style={styles.headerIcons}>
            <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/chat',
                  params: { roomId: roomId?.toString() }
                })}
                style={styles.iconButton}
            >
              <Ionicons name="chatbubbles" size={24} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={markNotificationsAsRead}
                style={styles.iconButton}
            >
              <Ionicons name="notifications" size={24} color="white" />
              {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
            style={styles.content}
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
        >
          {/* Compact Room Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.roomHeader}>
              {isEditing ? (
                  <TextInput
                      style={styles.roomNameInput}
                      value={editedName}
                      onChangeText={setEditedName}
                      autoFocus
                      placeholderTextColor="rgba(255,255,255,0.7)"
                  />
              ) : (
                  <Text style={styles.roomNameText}>{room.roomName}</Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {room.type === "PUBLIC" ? "Public" : "Private"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Owner:</Text>
              <Text style={styles.detailValue}>
                {isOwner ? "You" : `User #${room.ownerId}`}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Code:</Text>
              <Text style={styles.detailValue}>{room.join_code}</Text>
              <TouchableOpacity onPress={copyRoomCode} style={styles.copyButton}>
                <Ionicons name="copy" size={18} color="#16A34A" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Users:</Text>
              <View style={styles.usersContainer}>
                {roomUsers.length === 0 ? (
                    <Text style={styles.emptyText}>No users yet</Text>
                ) : (
                    roomUsers.map((user) => (
                        <View key={user.userId} style={styles.userRow}>
                          <Text style={styles.userText}>
                            {user.username}
                            {user.userId === userId && " (You)"}
                            {user.userId === room.ownerId && " (Owner)"}
                          </Text>

                          {isOwner && user.userId !== userId && user.userId !== room.ownerId && (
                              <TouchableOpacity
                                  onPress={() => handleRemoveUser(user.username)}
                                  style={styles.removeButton}
                              >
                                <Ionicons name="close" size={16} color="#ef4444" />
                              </TouchableOpacity>
                          )}
                        </View>
                    ))
                )}
              </View>
            </View>

            {/* Transparent Action Buttons */}
            {isOwner && (
                <View style={styles.ownerActions}>
                  {isEditing ? (
                      <>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.cancelButton]}
                            onPress={() => setIsEditing(false)}
                            disabled={isUpdating}
                        >
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.saveButton]}
                            onPress={handleUpdateRoom}
                            disabled={isUpdating}
                        >
                          {isUpdating ? (
                              <ActivityIndicator color="white" />
                          ) : (
                              <Text style={styles.buttonText}>Save</Text>
                          )}
                        </TouchableOpacity>
                      </>
                  ) : (
                      <>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.editButton]}
                            onPress={() => setIsEditing(true)}
                        >
                          <Text style={styles.buttonText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={handleDeleteRoom}
                            disabled={isDeleting}
                        >
                          {isDeleting ? (
                              <ActivityIndicator color="white" />
                          ) : (
                              <Text style={styles.buttonText}>Delete</Text>
                          )}
                        </TouchableOpacity>
                      </>
                  )}
                </View>
            )}
          </View>

          {/* Posts Section */}
          <Text style={styles.sectionTitle}>Community Posts</Text>

          {posts.length === 0 ? (
              <View style={styles.emptyPosts}>
                <Text style={styles.emptyText}>No posts yet</Text>
                <Text style={styles.emptySubtext}>Be the first to share!</Text>
              </View>
          ) : (
              posts.map((post) => (
                  <TouchableOpacity
                      key={post.id}
                      style={styles.postCard}
                      onPress={() => handlePostPress(post.id)}
                  >
                    <Text style={styles.postTitle}>{post.title}</Text>
                    <Text style={styles.postContent} numberOfLines={3}>
                      {post.content}
                    </Text>

                    <View style={styles.postFooter}>
                      <Text style={styles.postAuthor}>
                        {post.author?.username || "Unknown"}
                      </Text>
                      <Text style={styles.postDate}>
                        {new Date(post.date).toLocaleDateString()}
                      </Text>
                    </View>

                    <View style={styles.postActions}>
                      <TouchableOpacity
                          style={styles.likeButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleLike(post.id);
                          }}
                          disabled={likingPostIds.has(post.id)}
                      >
                        {likingPostIds.has(post.id) ? (
                            <ActivityIndicator size="small" color="#ef4444" />
                        ) : (
                            <Ionicons
                                name={post.isLikedByUser ? "heart" : "heart-outline"}
                                size={18}
                                color={post.isLikedByUser ? "#ef4444" : "rgba(255,255,255,0.7)"}
                            />
                        )}
                        <Text style={styles.likeCount}>{post.likes}</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
              ))
          )}

          {/* Compact Create Post Form */}
          <View style={styles.createPostCard}>
            <Text style={styles.sectionTitle}>Create New Post</Text>

            <TextInput
                style={styles.input}
                placeholder="Post title"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={newPostTitle}
                onChangeText={setNewPostTitle}
            />

            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What would you like to share?"
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={newPostContent}
                onChangeText={setNewPostContent}
                multiline
                numberOfLines={3}
            />

            <TouchableOpacity
                style={styles.postButton}
                onPress={createPost}
                disabled={isCreatingPost}
            >
              {isCreatingPost ? (
                  <ActivityIndicator color="white" />
              ) : (
                  <Text style={styles.buttonText}>Create Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
  );
}


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
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
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    contentContainer: {
      flex: 1,
      zIndex: 1,
    },
    topBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      paddingTop: 50,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    topBarIcons: {
      flexDirection: 'row',
      gap: 16,
    },
    iconButton: {
      padding: 6,
    },
    notificationBadge: {
      position: "absolute",
      right: -5,
      top: -5,
      backgroundColor: "red",
      borderRadius: 10,
      width: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "bold",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 30,
    },
    compactInfoCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },
    roomHeader: {
      marginBottom: 10,
    },
    roomNameText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
    },
    roomNameInput: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      borderBottomWidth: 1,
      borderBottomColor: '#16A34A',
      paddingVertical: 6,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      color: 'rgba(255,255,255,0.7)',
      width: 70,
      fontSize: 13,
    },
    detailValue: {
      color: 'white',
      flex: 1,
      fontSize: 13,
    },
    usersList: {
      flex: 1,
      marginTop: 4,
    },
    userItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    userText: {
      color: 'white',
      fontSize: 13,
      flexShrink: 1,
    },
    removeButton: {
      padding: 4,
    },
    ownerActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      gap: 8,
    },
    actionButton: {
      flex: 1,
      borderRadius: 20,
      paddingVertical: 8,
      alignItems: 'center',
      borderWidth: 1,
    },
    editButton: {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgba(59, 130, 246, 0.5)',
    },
    deleteButton: {
      backgroundColor: 'rgba(239, 68, 68, 0.2)',
      borderColor: 'rgba(239, 68, 68, 0.5)',
    },
    saveButton: {
      backgroundColor: 'rgba(22, 163, 74, 0.2)',
      borderColor: 'rgba(22, 163, 74, 0.5)',
    },
    cancelButton: {
      backgroundColor: 'rgba(107, 114, 128, 0.2)',
      borderColor: 'rgba(107, 114, 128, 0.5)',
    },
    buttonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
    sectionTitle: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    emptyPosts: {
      alignItems: 'center',
      padding: 16,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      marginBottom: 16,
    },
    emptyText: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 16,
    },
    emptySubtext: {
      color: 'rgba(255,255,255,0.5)',
      fontSize: 14,
      marginTop: 4,
    },
    postCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
    },
    postTitle: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 6,
    },
    postContent: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 14,
      marginBottom: 8,
    },
    postFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    postAuthor: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12,
    },
    postDate: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: 12,
    },
    postActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    likeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    likeCount: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: 14,
    },
    createPostCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: 12,
      marginTop: 8,
    },
    input: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      color: 'white',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 14,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    textArea: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    postButton: {
      backgroundColor: 'rgba(22, 163, 74, 0.7)',
      borderRadius: 20,
      paddingVertical: 12,
      alignItems: 'center',
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#0f172a",
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 18,
    },
    copyButton: {
      marginLeft: 8,
      padding: 4,
    },


    content: {
      flex: 1,
      padding: 10,
    },
    infoCard: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: 15,
      marginBottom: 20,
    },
    roomNameContainer: {
      marginBottom: 15,
    },

    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 15,
    },
    button: {
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      alignItems: "center",
      minWidth: 100,
    },

    chatContainer: {
      marginBottom: 20,
    },
    messageBubble: {
      borderRadius: 12,
      padding: 12,
      marginBottom: 10,
      maxWidth: "80%",
    },
    headerTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: '600',
    },
    headerIcons: {
      flexDirection: 'row',
      gap: 16,
    },

    myMessage: {
      alignSelf: "flex-end",
      backgroundColor: "#2563eb",
      borderBottomRightRadius: 2,
    },
    otherMessage: {
      alignSelf: "flex-start",
      backgroundColor: "#334155",
      borderBottomLeftRadius: 2,
    },
    senderName: {
      color: "#e2e8f0",
      fontWeight: "bold",
      fontSize: 12,
      marginBottom: 4,
    },
    messageText: {
      color: "white",
      fontSize: 16,
    },
    messageTime: {
      color: "#cbd5e1",
      fontSize: 10,
      alignSelf: "flex-end",
      marginTop: 4,
    },

    postItem: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
    },


    postContentText: {
      color: "#cbd5e1",
      marginBottom: 10,
    },

    postForm: {
      marginTop: 20,
      marginBottom: 50,
    },

    messageInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      backgroundColor: "#1e293b",
      borderTopWidth: 1,
      borderTopColor: "#334155",
    },
    messageInput: {
      flex: 1,
      backgroundColor: "#0f172a",
      color: "white",
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginRight: 10,
    },
    sendButton: {
      padding: 10,
    },

    commentButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: 5,
    },
    commentText: {
      color: "#94a3b8",
      marginLeft: 5,
      fontSize: 14,
    },
    userRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },

    removeUserButton: {
      padding: 4,
      marginLeft: 8,
    },
    chatIcon: {
      padding: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      paddingTop: 50,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
    },
    usersContainer: {
      flex: 1,
      marginTop: 8,
    },
  });