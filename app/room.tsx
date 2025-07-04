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
  ImageBackground,
} from "react-native";
import { Video, ResizeMode } from "expo-av";

import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ToastAndroid } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import i18n from "../constants/i18n";
import { HeaderWithNotifications } from "../components/HeaderWithNotifications";

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
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function RoomScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const roomId = id ? parseInt(id as string) : null;

  // تحديد اتجاه النص
  const isRTL = i18n.locale === "ar";
  const textStyle = isRTL ? styles.rtlText : styles.ltrText;
  const flexDirection = isRTL ? "row-reverse" : "row";

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string>("");
  const [isOwner, setIsOwner] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  // Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roomUsers, setRoomUsers] = useState<User[]>([]);
  const [likingPostIds, setLikingPostIds] = useState<Set<number>>(new Set());
  const [refreshCount, setRefreshCount] = useState(0);
  const [userRole, setUserRole] = useState<string>("");
  const [deletingPostIds, setDeletingPostIds] = useState<Set<number>>(
    new Set()
  );

  const stompClient = useRef<any>(null);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  const scrollViewRef = useRef<ScrollView>(null);

  const connectWebSocket = (usernameParam?: string) => {
    const effectiveUsername = usernameParam || username;
    if (!effectiveUsername) {
      console.warn("⚠️ Username not set, delaying WebSocket connection");
      return;
    }
    const socket = new SockJS(`${API_BASE_URL}/ws-chat`);
    stompClient.current = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log(
          "✅ WebSocket connected, subscribing to notifications on /user/" +
            effectiveUsername
        );
        stompClient.current.subscribe(
          `/user/${effectiveUsername}/queue/notifications`,
          (frame: any) => {
            console.log("📨 Raw WS frame.body:", frame.body);
            try {
              const notif: Notification = JSON.parse(frame.body);
              console.log("🔔 Parsed notification:", notif);
              console.log(
                "🔍 Current username for comparison:",
                effectiveUsername
              );
              console.log("🔍 Notification message:", notif.message);

              // ► ENHANCED SELF-NOTIFICATION FILTERING
              const isSelfNotification =
                notif.message &&
                typeof notif.message === "string" &&
                effectiveUsername &&
                notif.message.startsWith(`${effectiveUsername}:`);

              console.log("🔍 Is self notification check:", {
                username: effectiveUsername,
                notificationmessage: notif.message,
                messageType: typeof notif.message,
                startsWithUsername: isSelfNotification,
              });

              if (isSelfNotification) {
                console.log("🚫 Dropping self notification:", notif.message);
                return;
              }

              console.log(
                "✅ Processing notification from another user:",
                notif.message
              );

              // ► DEDUPE + UNisRead COUNT
              setNotifications((prev) => {
                if (prev.some((n) => n.id === notif.id)) {
                  console.log("🔁 Duplicate detected, skipping id:", notif.id);
                  return prev;
                }
                console.log("➕ Adding notification id:", notif.id);
                if (!notif.isRead) {
                  setUnreadCount((c) => {
                    const nc = c + 1;
                    console.log("🔢 New unreadCount:", nc);
                    return nc;
                  });
                }
                return [notif, ...prev];
              });

              // ► SHOW TOAST FOR UNisRead ONLY
              if (!notif.isRead) {
                console.log(
                  "🔔 Showing toast for notification:",
                  notif.message
                );
                if (Platform.OS === "android") {
                  ToastAndroid.show(notif.message, ToastAndroid.SHORT);
                } else {
                  Alert.alert("New Notification", notif.message);
                }
              }
            } catch (err) {
              console.error("❌ Error processing WS notification:", err);
            }
          }
        );
      },
      onStompError: (err) => console.error("⚠️ STOMP error:", err),
    });

    stompClient.current.activate();
  };

  const fetchRoom = async (currentUserId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(i18n.t("room.fetchRoomError"));

      const data: Room = await response.json();
      setRoom(data);
      setEditedName(data.roomName);
      const ownerStatus = currentUserId === data.ownerId;
      setIsOwner(ownerStatus);

      try {
        const userResponse = await fetch(
          `${API_BASE_URL}/api/users/${currentUserId}`,
          { credentials: "include" }
        );
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUserRole(userData.userRole);
        }
      } catch (error) {
        console.log(i18n.t("room.fetchRoleError"), error);
      }
    } catch (error) {
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error && error.message
          ? error.message
          : i18n.t("room.loadRoomError")
      );
    }
  };

  const fetchNotifications = async (
    currentUserId: number,
    usernameParam?: string
  ) => {
    const effectiveUsername = usernameParam || username;
    console.log("🔍 fetchNotifications for userId:", currentUserId);
    console.log("🔍 Current username for filtering:", effectiveUsername);
    console.log("🔍 Username state:", username);
    console.log("🔍 Username parameter:", usernameParam);

    try {
      const resp = await fetch(
        `${API_BASE_URL}/api/notifications?userId=${currentUserId}`,
        { credentials: "include" }
      );
      console.log("  → HTTP status:", resp.status);
      if (!resp.ok) throw new Error(`Status ${resp.status}`);

      const data: Notification[] = await resp.json();
      console.log("  → Raw notifications:", data);

      // ► ENHANCED SELF-NOTIFICATION FILTERING
      const filtered = data.filter((n) => {
        // Safety check for message and effectiveUsername
        if (!n.message || typeof n.message !== "string" || !effectiveUsername) {
          console.log(
            "🔍 Skipping notification with invalid message or username:",
            {
              id: n.id,
              message: n.message,
              username: effectiveUsername,
            }
          );
          return true; // Keep notifications with invalid data
        }

        const isSelf = n.message.startsWith(`${effectiveUsername}:`);
        console.log("🔍 Filtering notification:", {
          id: n.id,
          message: n.message,
          username: effectiveUsername,
          isSelf: isSelf,
        });

        if (isSelf) {
          console.log("🚫 Filtering out self notification:", n.message);
          return false;
        }
        return true;
      });
      console.log("  → After filtering self notifications:", filtered);

      setNotifications(filtered);

      // ► UPDATE UNREAD COUNT
      const unread = filtered.filter((n) => !n.isRead).length;
      console.log("  → Calculated unreadCount:", unread);
      setUnreadCount(unread);
    } catch (err) {
      console.error("❌ fetchNotifications error:", err);
    }
  };
  const loadCurrentUser = async (uid: number) => {
    console.log("👤 Loading current user with ID:", uid);

    const res = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    const currentUser: User = await res.json();
    console.log("✅ Fetched user:", currentUser);
    console.log("✅ Setting username to:", currentUser.username);

    setUsername(currentUser.username);
    await AsyncStorage.setItem("username", currentUser.username);

    return currentUser;
  };

  // Optimized markNotificationsAsRead
  const markNotificationsAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    console.log("Marking notifications as read");

    try {
      // Optimistic update
      const updatedNotifications = notifications.map((n) => ({
        ...n,
        read: true,
      }));
      setNotifications(updatedNotifications);
      setUnreadCount(0);

      const response = await fetch(
        `${API_BASE_URL}/api/notifications/mark-read?userId=${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Mark read failed: " + response.status);
      }

      console.log("Notifications marked as read successfully");
    } catch (error) {
      console.error("Mark read error:", error);
      // Revert on error
      fetchNotifications(userId);
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

      if (!response.ok) throw new Error(i18n.t("room.fetchMessagesError"));

      const data: Message[] = await response.json();
      setMessages(data);
    } catch (error) {
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error && error.message
          ? error.message
          : i18n.t("room.loadMessagesError")
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
      if (!response.ok) throw new Error(i18n.t("room.fetchPostsError"));

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
        i18n.t("room.error"),
        error instanceof Error ? error.message : i18n.t("room.loadPostsError")
      );
    }
  };

  const fetchRoomUsers = async () => {
    if (!roomId) return;
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error(i18n.t("room.fetchUsersError"));

      const data = await response.json();
      let users = [];
      if (Array.isArray(data)) {
        users = data;
      } else if (data._embedded?.users) {
        users = data._embedded.users;
      } else if (data.users) {
        users = data.users;
      }
      setRoomUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error(i18n.t("room.fetchUsersError"), error);
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error ? error.message : i18n.t("room.loadUsersError")
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
        i18n.t("room.error"),
        error instanceof Error && error.message
          ? error.message
          : i18n.t("room.sendMessageError")
      );
    } finally {
      setIsSending(false);
    }
  };

  const createPost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert(i18n.t("room.error"), i18n.t("room.postFieldsRequired"));
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
          `${i18n.t("room.createPostError")}: ${response.status} - ${errorText}`
        );
      }

      const newPost = await response.json();
      setPosts((prev) => [...prev, newPost]);
      setNewPostTitle("");
      setNewPostContent("");
      Alert.alert(i18n.t("room.success"), i18n.t("room.postCreatedSuccess"));
    } catch (error) {
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error && error.message
          ? error.message
          : i18n.t("room.createPostError")
      );
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleUpdateRoom = async () => {
    if (!room || !editedName.trim()) {
      Alert.alert(i18n.t("room.error"), i18n.t("room.roomNameRequired"));
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

      if (!response.ok) throw new Error(i18n.t("room.updateRoomError"));

      const updatedRoom = await response.json();
      setRoom(updatedRoom);
      setIsEditing(false);
      Alert.alert(i18n.t("room.success"), i18n.t("room.roomUpdatedSuccess"));
    } catch (error) {
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error && error.message
          ? error.message
          : i18n.t("room.updateRoomError")
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!room) return;

    Alert.alert(
      i18n.t("room.confirmDeleteTitle"),
      i18n.t("room.confirmDeleteMessage", { roomName: room.roomName }),
      [
        { text: i18n.t("room.cancel"), style: "cancel" },
        {
          text: i18n.t("room.delete"),
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
                method: "DELETE",
                credentials: "include",
              });

              if (!response.ok) throw new Error(i18n.t("room.deleteRoomError"));

              Alert.alert(
                i18n.t("room.success"),
                i18n.t("room.roomDeletedSuccess")
              );
              router.back();
            } catch (error) {
              Alert.alert(
                i18n.t("room.error"),
                error instanceof Error && error.message
                  ? error.message
                  : i18n.t("room.deleteRoomError")
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const copyRoomCode = async () => {
    if (room?.join_code) {
      await Clipboard.setStringAsync(room.join_code);
      Alert.alert(i18n.t("room.copied"), i18n.t("room.roomCodeCopied"));
    }
  };
  const fetchRoomAndUser = async (uid: number, rid: number) => {
    try {
      console.log("🚀 Starting fetchRoomAndUser flow");

      // a) load user first and wait for username to be set
      const currentUser = await loadCurrentUser(uid);
      console.log("✅ User loaded, username set to:", currentUser.username);

      // b) now load room
      const roomData = await loadRoom(rid);

      // c) owner check
      const isOwnerFlag = currentUser.userId === roomData.ownerId;
      setIsOwner(isOwnerFlag);
      console.log("👑 Owner status:", isOwnerFlag);

      // d) fetch role if needed
      const roleRes = await fetch(`${API_BASE_URL}/api/users/${uid}`, {
        credentials: "include",
      });
      if (roleRes.ok) {
        const { userRole: role } = await roleRes.json();
        setUserRole(role);
        console.log("🎭 User role set to:", role);
      }

      return currentUser;
    } catch (error) {
      console.error("❌ Error in fetchRoomAndUser:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  };

  const loadRoom = async (roomId: number) => {
    const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error(`Failed to fetch room: ${res.status}`);
    const data: Room = await res.json();
    console.log("Fetched room:", data);
    setRoom(data);
    setEditedName(data.roomName);
    return data;
  };
  // Then in your focus effect (or useEffect):
  useFocusEffect(
    useCallback(() => {
      (async () => {
        console.log("🔄 Focus effect triggered");

        const storedUid = await AsyncStorage.getItem("userId");
        const storedUsername = await AsyncStorage.getItem("username");

        console.log("📱 Stored userId:", storedUid);
        console.log("📱 Stored username:", storedUsername);

        if (!storedUid || !roomId) {
          console.warn("⚠️ Missing userId or roomId");
          return;
        }

        const uid = parseInt(storedUid, 10);
        setUserId(uid);

        // If we have stored username, set it immediately
        if (storedUsername) {
          console.log("📱 Setting username from storage:", storedUsername);
          setUsername(storedUsername);
        }

        try {
          // fetch both user and room (this will also set/update username)
          const currentUser = await fetchRoomAndUser(uid, roomId);

          // Now that username is properly set, we can safely do other operations
          console.log("🔗 Username confirmed as:", currentUser.username);

          // ... now messages, posts, notifications, users, websocket…
          await fetchMessages();
          await fetchPosts(uid);
          await fetchNotifications(uid, currentUser.username);
          await fetchRoomUsers();

          // Connect WebSocket AFTER username is set and pass username explicitly
          console.log(
            "🔌 Connecting WebSocket with username:",
            currentUser.username
          );
          connectWebSocket(currentUser.username);

          setLoading(false);
          console.log("✅ All data loaded successfully");
        } catch (error) {
          console.error("❌ Error in focus effect:", error);
          setLoading(false);
        }
      })();
    }, [roomId])
  );

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
    setLikingPostIds((prev) => new Set(prev).add(postId));

    try {
      const response = await fetch(`${API_BASE_URL}/rooms/likes/${postId}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!response.ok) throw new Error(i18n.t("room.toggleLikeError"));
      setRefreshCount((prev) => prev + 1);
    } catch (error) {
      Alert.alert(
        i18n.t("room.error"),
        error instanceof Error ? error.message : i18n.t("room.toggleLikeError")
      );
    } finally {
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
      i18n.t("room.removeUserTitle"),
      i18n.t("room.removeUserMessage", { username }),
      [
        { text: i18n.t("room.cancel"), style: "cancel" },
        {
          text: i18n.t("room.remove"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_BASE_URL}/rooms/${roomId}/remove-user/${username}`,
                {
                  method: "DELETE",
                  credentials: "include",
                }
              );
              if (!response.ok) throw new Error(i18n.t("room.removeUserError"));
              await fetchRoomUsers();
              Alert.alert(
                i18n.t("room.success"),
                i18n.t("room.userRemovedSuccess", { username })
              );
            } catch (error) {
              Alert.alert(
                i18n.t("room.error"),
                error instanceof Error
                  ? error.message
                  : i18n.t("room.removeUserError")
              );
            }
          },
        },
      ]
    );
  };

  const handleAdminDeletePost = async (postId: number, postTitle: string) => {
    if (userRole !== "ADMIN") {
      Alert.alert(i18n.t("room.error"), i18n.t("room.adminOnlyDelete"));
      return;
    }

    Alert.alert(
      i18n.t("room.adminDeleteTitle"),
      i18n.t("room.adminDeleteMessage", { postTitle }),
      [
        { text: i18n.t("room.cancel"), style: "cancel" },
        {
          text: i18n.t("room.delete"),
          style: "destructive",
          onPress: async () => {
            if (deletingPostIds.has(postId)) return;

            setDeletingPostIds((prev) => new Set(prev).add(postId));
            try {
              const response = await fetch(
                `${API_BASE_URL}/rooms/forceDelete/${postId}`,
                {
                  method: "DELETE",
                  credentials: "include",
                }
              );

              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || i18n.t("room.deletePostError"));
              }

              setPosts((prev) => prev.filter((post) => post.id !== postId));
              Alert.alert(
                i18n.t("room.success"),
                i18n.t("room.postDeletedSuccess")
              );
            } catch (error) {
              Alert.alert(
                i18n.t("room.error"),
                error instanceof Error
                  ? error.message
                  : i18n.t("room.deletePostError")
              );
            } finally {
              setDeletingPostIds((prev) => {
                const copy = new Set(prev);
                copy.delete(postId);
                return copy;
              });
            }
          },
        },
      ]
    );
  };

  const handleOwnerDeletePost = async (postId: number, postTitle: string) => {
    if (!userId) {
      Alert.alert(i18n.t("room.error"), i18n.t("room.userNotAuthenticated"));
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post || post.author?.userId !== userId) {
      Alert.alert(i18n.t("room.error"), i18n.t("room.deleteOwnPostsOnly"));
      return;
    }

    Alert.alert(
        i18n.t("room.deletePostTitle"),
        i18n.t("room.deletePostMessage", { postTitle }),
        [
          { text: i18n.t("room.cancel"), style: "cancel" },
          {
            text: i18n.t("room.delete"),
            style: "destructive",
            onPress: async () => {
              if (deletingPostIds.has(postId)) return;

              setDeletingPostIds((prev) => new Set(prev).add(postId));
              try {
                const response = await fetch(
                    `${API_BASE_URL}/rooms/delete/${postId}/${userId}`,
                    {
                      method: "DELETE",
                      credentials: "include",
                    }
                );

                if (!response.ok) {
                  const errorText = await response.text();
                  throw new Error(errorText || i18n.t("room.deletePostError"));
                }

                setPosts((prev) => prev.filter((post) => post.id !== postId));
                Alert.alert(
                    i18n.t("room.success"),
                    i18n.t("room.postDeletedSuccess")
                );
              } catch (error) {
                Alert.alert(
                    i18n.t("room.error"),
                    error instanceof Error
                        ? error.message
                        : i18n.t("room.deletePostError")
                );
              } finally {
                setDeletingPostIds((prev) => {
                  const copy = new Set(prev);
                  copy.delete(postId);
                  return copy;
                });
              }
            },
          },
        ]
    );
  };

  if (loading) {
    return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading room...</Text>
        </View>
    );
  }

  if (!room) {
    return (
        <View style={styles.center}>
          <Text style={styles.errorText}>{i18n.t("room.roomNotFound")}</Text>
        </View>
    );
  }

  return (
      <ImageBackground
          source={require("../assets/background-photo.png")}
          style={styles.container}
          resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
            style={styles.content}
            ref={scrollViewRef}
            onContentSizeChange={() => scrollToBottom()}
            showsVerticalScrollIndicator={false}
        >
          {/* Modern Header */}
          <HeaderWithNotifications isRTL={isRTL} style={styles.topBar} />

          {/* Floating Action Button */}
          <View style={styles.floatingActionContainer}>
            <TouchableOpacity
                onPress={() =>
                    router.push({
                      pathname: "/chat",
                      params: { roomId: roomId?.toString() },
                    })
                }
                style={styles.floatingChatButton}
            >
              <Ionicons name="chatbubbles" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Modern Room Info Card */}
          <View style={styles.modernInfoCard}>
            <View style={styles.cardHeader}>
              <View style={styles.roomNameContainer}>
                {isEditing ? (
                    <TextInput
                        style={[styles.roomNameInput, textStyle]}
                        value={editedName}
                        onChangeText={setEditedName}
                        autoFocus
                    />
                ) : (
                    <Text style={[styles.roomNameText, textStyle]}>
                      {room.roomName}
                    </Text>
                )}
              </View>
              <View style={styles.roomTypeChip}>
                <Text style={styles.chipText}>
                  {room.type === "PUBLIC"
                      ? i18n.t("room.public")
                      : i18n.t("room.private")}
                </Text>
              </View>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color="#22c55e" />
                <Text style={styles.infoLabel}>{i18n.t("room.owner")}</Text>
                <Text style={[styles.infoValue, textStyle]}>
                  {isOwner
                      ? i18n.t("room.you")
                      : `${i18n.t("room.user")} #${room.ownerId}`}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="key" size={16} color="#22c55e" />
                <Text style={styles.infoLabel}>{i18n.t("room.roomCode")}</Text>
                <View style={styles.codeContainer}>
                  <Text style={[styles.infoValue, textStyle]}>
                    {room.join_code}
                  </Text>
                  <TouchableOpacity onPress={copyRoomCode} style={styles.modernCopyButton}>
                    <Ionicons name="copy" size={16} color="#22c55e" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Modern Users Section */}
            <View style={styles.usersSection}>
              <View style={styles.usersSectionHeader}>
                <Ionicons name="people" size={18} color="#22c55e" />
                <Text style={styles.sectionHeaderText}>
                  {i18n.t("room.users")} ({roomUsers.length})
                </Text>
              </View>

              <View style={styles.usersGrid}>
                {roomUsers.length === 0 ? (
                    <Text style={[styles.emptyText, textStyle]}>
                      {i18n.t("room.noUsers")}
                    </Text>
                ) : (
                    roomUsers.map((user, index) => (
                        <View
                            key={`user-${user.userId}-${index}`}
                            style={styles.userChip}
                        >
                          <View style={styles.userAvatar}>
                            <Ionicons name="person" size={14} color="white" />
                          </View>
                          <Text style={[styles.userName, textStyle]}>
                            {typeof user === "object" && user !== null
                                ? user.username || i18n.t("room.unknownUser")
                                : String(user)}
                          </Text>
                          {user.userId === userId && (
                              <View style={styles.youBadge}>
                                <Text style={styles.youBadgeText}>You</Text>
                              </View>
                          )}
                          {user.userId === room?.ownerId && (
                              <View style={styles.ownerBadge}>
                                <Ionicons name="star" size={12} color="#fbbf24" />
                              </View>
                          )}
                          {isOwner &&
                              user.userId !== userId &&
                              user.userId !== room?.ownerId && (
                                  <TouchableOpacity
                                      style={styles.removeUserButton}
                                      onPress={() =>
                                          handleRemoveUser(
                                              user.username || i18n.t("room.unknownUser")
                                          )
                                      }
                                  >
                                    <Ionicons name="close" size={14} color="#ef4444" />
                                  </TouchableOpacity>
                              )}
                        </View>
                    ))
                )}
              </View>
            </View>

            {/* Modern Action Buttons */}
            {isOwner && (
                <View style={styles.modernActionsContainer}>
                  {isEditing ? (
                      <>
                        <TouchableOpacity
                            style={[styles.modernButton, styles.cancelButton]}
                            onPress={() => setIsEditing(false)}
                            disabled={isUpdating}
                        >
                          <Ionicons name="close" size={16} color="white" />
                          <Text style={styles.buttonText}>
                            {i18n.t("room.cancel")}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modernButton, styles.saveButton]}
                            onPress={handleUpdateRoom}
                            disabled={isUpdating}
                        >
                          {isUpdating ? (
                              <ActivityIndicator color="white" size="small" />
                          ) : (
                              <>
                                <Ionicons name="checkmark" size={16} color="white" />
                                <Text style={styles.buttonText}>
                                  {i18n.t("room.save")}
                                </Text>
                              </>
                          )}
                        </TouchableOpacity>
                      </>
                  ) : (
                      <>
                        <TouchableOpacity
                            style={ styles.editButton}
                            onPress={() => setIsEditing(true)}
                        >
                          <Ionicons name="create" size={16} color="white" />
                          <Text style={styles.buttonText}>{i18n.t("room.edit")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[ styles.deleteButton]}
                            onPress={handleDeleteRoom}
                            disabled={isDeleting}
                        >
                          {isDeleting ? (
                              <ActivityIndicator color="white" size="small" />
                          ) : (
                              <>
                                <Ionicons name="trash" size={16} color="white" />
                                <Text style={styles.buttonText}>
                                  {i18n.t("room.delete")}
                                </Text>
                              </>
                          )}
                        </TouchableOpacity>
                      </>
                  )}
                </View>
            )}
          </View>

          {/* Modern Posts Section */}
          <View style={styles.postsSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text" size={20} color="#22c55e" />
              <Text style={[styles.sectionTitle, textStyle]}>
                {i18n.t("room.posts")}
              </Text>
            </View>

            {posts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="document-text-outline" size={48} color="#64748b" />
                  <Text style={[styles.emptyText, textStyle]}>
                    {i18n.t("room.noPosts")}
                  </Text>
                </View>
            ) : (
                posts.map((post) => (
                    <View key={`post-${post.id}`} style={styles.modernPostCard}>
                      <TouchableOpacity
                          onPress={() => handlePostPress(post.id)}
                          style={styles.postContent}
                      >
                        <Text style={[styles.postTitle, textStyle]}>{post.title}</Text>
                        <Text style={[styles.postContentText, textStyle]}>
                          {post.content}
                        </Text>

                        <View style={styles.postMeta}>
                          <View style={styles.authorInfo}>
                            <View style={styles.authorAvatar}>
                              <Ionicons name="person" size={12} color="white" />
                            </View>
                            <Text style={[styles.postAuthor, textStyle]}>
                              {post.author?.username || i18n.t("room.unknownAuthor")}
                            </Text>
                          </View>
                          <Text style={[styles.postDate, textStyle]}>
                            {new Date(post.date).toLocaleDateString()}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <View style={styles.postActionsBar}>
                        <TouchableOpacity
                            style={styles.modernLikeButton}
                            onPress={() => handleLike(post.id)}
                            disabled={likingPostIds.has(post.id)}
                        >
                          {likingPostIds.has(post.id) ? (
                              <ActivityIndicator size="small" color="#ef4444" />
                          ) : (
                              <Ionicons
                                  name={post.isLikedByUser ? "heart" : "heart-outline"}
                                  size={18}
                                  color={post.isLikedByUser ? "#ef4444" : "#64748b"}
                              />
                          )}
                          <Text style={styles.actionText}>{post.likes}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modernCommentButton}
                            onPress={() => handlePostPress(post.id)}
                        >
                          <Ionicons name="chatbubble-outline" size={18} color="#64748b" />
                          <Text style={styles.actionText}>
                            {i18n.t("room.comment")}
                          </Text>
                        </TouchableOpacity>

                        {post.author?.userId === userId && (
                            <TouchableOpacity
                                style={styles.modernDeleteButton}
                                onPress={() => handleOwnerDeletePost(post.id, post.title)}
                                disabled={deletingPostIds.has(post.id)}
                            >
                              {deletingPostIds.has(post.id) ? (
                                  <ActivityIndicator size="small" color="#f59e0b" />
                              ) : (
                                  <Ionicons name="trash-outline" size={18} color="#f59e0b" />
                              )}
                            </TouchableOpacity>
                        )}
                      </View>
                    </View>
                ))
            )}
          </View>

          {/* Modern Post Creation Form */}
          {((userRole == "ADMIN" && room.type == "PUBLIC") ||
              room.type == "PRIVATE") && (
              <View style={styles.modernPostForm}>
                <View style={styles.formHeader}>
                  <Ionicons name="create" size={20} color="#22c55e" />
                  <Text style={[styles.sectionTitle, textStyle]}>
                    {i18n.t("room.createPost")}
                  </Text>
                </View>

                <View style={styles.formContent}>
                  <TextInput
                      style={[styles.modernInput, textStyle]}
                      placeholder={i18n.t("room.postTitlePlaceholder")}
                      placeholderTextColor="#64748b"
                      value={newPostTitle}
                      onChangeText={setNewPostTitle}
                  />
                  <TextInput
                      style={[styles.modernInput, styles.modernTextArea, textStyle]}
                      placeholder={i18n.t("room.postContentPlaceholder")}
                      placeholderTextColor="#64748b"
                      value={newPostContent}
                      onChangeText={setNewPostContent}
                      multiline
                      numberOfLines={4}
                  />
                  <TouchableOpacity
                      style={[styles.modernButton, styles.createPostButton]}
                      onPress={createPost}
                      disabled={isCreatingPost}
                  >
                    {isCreatingPost ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                          <Ionicons name="send" size={16} color="white" />
                          <Text style={styles.buttonText}>
                            {i18n.t("room.createPostButton")}
                          </Text>
                        </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
          )}
        </ScrollView>
      </ImageBackground>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.7)", // Dark slate overlay instead of green
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#cbd5e1",
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "500",
  },
  topBar: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  // Floating Action Button
  floatingActionContainer: {
    position: "absolute",
    top: 30,
    right: 130,
    zIndex: 100,
  },
  floatingChatButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#22c55e",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Modern Info Card - Muted background with subtle green accents
  modernInfoCard: {
    backgroundColor: "rgba(30, 41, 59, 0.9)", // Slate background instead of green
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)", // Subtle green border
    backdropFilter: "blur(10px)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  roomNameContainer: {
    flex: 1,
  },
  roomNameInput: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    borderBottomWidth: 2,
    borderBottomColor: "#22c55e",
    paddingBottom: 8,
  },
  roomNameText: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
  },
  roomTypeChip: {
    backgroundColor: "rgba(34, 197, 94, 0.15)", // More subtle green
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  chipText: {
    color: "#4ade80", // Lighter green
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  // Info Grid - Using neutral grays with green accents
  infoGrid: {
    gap: 16,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51, 65, 85, 0.6)", // Slate gray background
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)", // Subtle border
  },
  infoLabel: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
    minWidth: 60,
  },
  infoValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modernCopyButton: {
    padding: 8,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderRadius: 8,
    marginLeft: 8,
  },

  // Users Section
  usersSection: {
    marginBottom: 24,
  },
  usersSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  usersGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  userChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(51, 65, 85, 0.7)", // Neutral gray for user chips
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.6)",
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#64748b",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
  },
  youBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "600",
  },
  ownerBadge: {
    padding: 2,
  },
  removeUserButton: {
    padding: 2,
  },

  // Modern Action Buttons - Using varied colors
  modernActionsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  modernButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    // gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  editButton: {
   backgroundColor: "rgba(59,130,246,0.35)", // Transparent blue
       borderColor: "rgba(59, 130, 246, 0.3)",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // elevation: 3,
}, deleteButton: {
   backgroundColor: "rgba(239,68,68,0.37)", // Transparent red
       borderColor: "rgba(239, 68, 68, 0.3)",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    // elevation: 3,
},
  cancelButton: {
    backgroundColor: "#64748b", // Gray for cancel
  },
  saveButton: {
    backgroundColor: "#22c55e", // Green for save
  },

  // Posts Section
  postsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },

  // Modern Post Cards - Neutral with subtle accents
  modernPostCard: {
    backgroundColor: "rgba(30, 41, 59, 0.9)", // Matching the info card
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)", // Subtle gray border
    backdropFilter: "blur(8px)",
  },
  postContent: {
    padding: 20,
  },
  postTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  postContentText: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  postMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  authorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#64748b",
    justifyContent: "center",
    alignItems: "center",
  },
  postAuthor: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "500",
  },
  postDate: {
    color: "#64748b",
    fontSize: 12,
  },

  // Post Actions Bar
  postActionsBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(71, 85, 105, 0.4)", // Subtle gray border
    gap: 20,
  },
  modernLikeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modernCommentButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modernDeleteButton: {
    marginLeft: "auto",
    padding: 4,
  },
  actionText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },

  // Modern Post Form
  modernPostForm: {
    backgroundColor: "rgba(30, 41, 59, 0.9)", // Matching other cards
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.3)", // Subtle green accent
    backdropFilter: "blur(10px)",
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  formContent: {
    gap: 16,
  },
  modernInput: {
    backgroundColor: "rgba(51, 65, 85, 0.6)", // Neutral input background
    color: "white",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(71, 85, 105, 0.5)",
  },
  modernTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  createPostButton: {
    backgroundColor: "#22c55e", // Green for create action
    alignSelf: "stretch",
  },

  // RTL Support
  rtlText: {
    textAlign: "right",
  },
  ltrText: {
    textAlign: "left",
  },
});



// //////backgroundColor: "rgba(245, 158, 11, 0.05)",
// editButton: {
//   backgroundColor: "rgba(59, 130, 246, 0.08)", // Transparent blue
//       borderColor: "rgba(59, 130, 246, 0.3)",
// },
// editButton: {
//   backgroundColor: "rgba(59, 130, 246, 0.08)",
//       borderColor: "rgba(59, 130, 246, 0.3)",
// },
// deleteButton: {
//   backgroundColor: "rgba(239, 68, 68, 0.08)", // Transparent red
//       borderColor: "rgba(239, 68, 68, 0.3)",
// },