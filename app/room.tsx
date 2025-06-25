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
//
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
  author: {
    userId: number;
    username: string;
    // add other fields as needed
  };
  date: string;
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

  const stompClient = useRef<any>(null);
  const API_BASE_URL = "http://192.168.1.19:8100";

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load user data
        const storedUsername = await AsyncStorage.getItem("username");
        const storedUserId = await AsyncStorage.getItem("userId");
        console.log("Stored userId:", storedUserId);

        if (storedUserId !== null) {
          const parsedUserId = parseInt(storedUserId);
          setUserId(parsedUserId);
          // Use parsedUserId immediately instead of the state variable userId
          console.log("Parsed userId:", parsedUserId);
        }

        // Fetch room details only if roomId is available.
        if (roomId) {
          await fetchRoom(); // This might use the freshly loaded userId if needed
          await fetchMessages();
          await fetchPosts();
          await fetchNotifications();
          connectWebSocket();
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (stompClient.current) {
        stompClient.current.deactivate();
      }
    };
  }, [roomId]);

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

  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch room");

      const data: Room = await response.json();
      console.log("Fetched room:", data);
      setRoom(data);
      setEditedName(data.roomName);

      const response2 = await fetch(
        `${API_BASE_URL}/api/users/${data.ownerId}`,
        {
          credentials: "include",
        }
      );
      const data2: User = await response2.json();
      console.log("Fetched room owner:", data2.userId);
      console.log("Fetched username:", userId);
      setIsOwner(userId === data2.userId);
      console.log("Is owner:", isOwner);
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

  // --- CHANGED: Use /rooms/posts/room/{roomId} ---
  const fetchPosts = async () => {
    if (!roomId) return;
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
      console.log(posts);
      console.log("Fetched posts:");
      console.log(data);
      setPosts(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Could not load posts"
      );
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications?userId=${userId}`,
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

  // --- CHANGED: Use /rooms/posts/create ---
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

  // Fetch room users whenever the roomId changes
  useEffect(() => {
    if (roomId) {
      fetchRoomUsers();
    }
  }, [roomId]);

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

  // Replace or add this effect to re-fetch room users on screen focus
  useFocusEffect(
    useCallback(() => {
      if (roomId) {
        fetchRoomUsers();
      }
    }, [roomId])
  );

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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollToBottom()}
      >
        {/* Back button and notifications at top of content */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity onPress={markNotificationsAsRead}>
            <Ionicons name="notifications" size={24} color="white" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Room Info */}
        <View style={styles.infoCard}>
          <View style={styles.roomNameContainer}>
            {isEditing ? (
              <TextInput
                style={styles.roomNameInput}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
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
              {isOwner ? "You" : `Userx #${room.ownerId}`}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Room Code:</Text>
            <Text style={styles.detailValue}>{`${room.join_code}`}</Text>
            <TouchableOpacity onPress={copyRoomCode} style={styles.copyButton}>
              <Ionicons name="copy" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Users:</Text>
            <View style={{ flex: 1 }}>
              {roomUsers.length === 0 ? (
                <Text style={styles.detailValue}>No users joined yet</Text>
              ) : (
                roomUsers.map((user) => (
                  <Text key={user.userId} style={styles.detailValue}>
                    {user.username}
                  </Text>
                ))
              )}
            </View>
          </View>

          {isOwner && (
            <View style={styles.actionsContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
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
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
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

        {/* Chat Section */}
        <Text style={styles.sectionTitle}>Chat</Text>
        <View style={styles.chatContainer}>
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No messages yet</Text>
          ) : (
            messages.map((message, index) => (
              <View
                key={`${message.id}-${index}`}
                style={[
                  styles.messageBubble,
                  message.senderId === userId
                    ? styles.myMessage
                    : styles.otherMessage,
                ]}
              >
                <Text style={styles.senderName}>
                  {message.senderId === userId ? "You" : message.senderName}
                </Text>
                <Text style={styles.messageText}>{message.content}</Text>
                <Text style={styles.messageTime}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Posts Section */}
        <Text style={styles.sectionTitle}>Posts</Text>
        {posts.length === 0 ? (
          <Text style={styles.emptyText}>No posts yet</Text>
        ) : (
          posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postContent}>{post.content}</Text>
              <Text style={styles.postAuthor}>By: {post.author.username}</Text>
            </View>
          ))
        )}

        {/* Create Post Form */}
        <View style={styles.postForm}>
          <Text style={styles.sectionTitle}>Create New Post</Text>
          <TextInput
            style={styles.input}
            placeholder="Post title"
            placeholderTextColor="#94a3b8"
            value={newPostTitle}
            onChangeText={setNewPostTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Post content"
            placeholderTextColor="#94a3b8"
            value={newPostContent}
            onChangeText={setNewPostContent}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={[styles.button, styles.postButton]}
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

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.messageInputContainer}
      >
        <TextInput
          style={styles.messageInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={isSending}
        >
          <Ionicons
            name="send"
            size={24}
            color={isSending ? "#94a3b8" : "#16A34A"}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  infoCard: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  roomNameContainer: {
    marginBottom: 15,
  },
  roomNameInput: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#16A34A",
    paddingBottom: 5,
  },
  roomNameText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#94a3b8",
    fontWeight: "bold",
    width: 80,
  },
  detailValue: {
    color: "white",
    flex: 1,
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
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#3b82f6",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
  },
  cancelButton: {
    backgroundColor: "#64748b",
  },
  saveButton: {
    backgroundColor: "#10b981",
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    marginVertical: 20,
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
  postCard: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  postTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  postContent: {
    color: "#cbd5e1",
    marginBottom: 10,
  },
  postAuthor: {
    color: "#94a3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  postForm: {
    marginTop: 20,
    marginBottom: 50,
  },
  input: {
    backgroundColor: "#1e293b",
    color: "white",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  postButton: {
    backgroundColor: "#16A34A",
    padding: 15,
    borderRadius: 8,
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
  copyButton: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: "#334155",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
});
