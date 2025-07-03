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
  ImageBackground
} from "react-native";
import { Video, ResizeMode } from 'expo-av';

import { useRouter, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
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
  const [deletingPostIds, setDeletingPostIds] = useState<Set<number>>(new Set());

  const stompClient = useRef<any>(null);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

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
      },
      onStompError: (frame) => {
        console.error(i18n.t("room.websocketError") + frame.headers["message"]);
        console.error(i18n.t("room.details") + frame.body);
      },
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

              Alert.alert(i18n.t("room.success"), i18n.t("room.roomDeletedSuccess"));
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadData() {
        try {
          setLoading(true);

          const storedUserId = await AsyncStorage.getItem("userId");
          const storedUsername = await AsyncStorage.getItem("username");

          if (!storedUserId) {
            Alert.alert(i18n.t("room.error"), i18n.t("room.userNotFound"));
            return;
          }

          const parsedUserId = parseInt(storedUserId);
          setUserId(parsedUserId);
          if (storedUsername) {
            setUsername(storedUsername);
          }

          if (roomId && isActive) {
            await fetchRoom(parsedUserId);
            await fetchMessages();
            await fetchPosts(parsedUserId);
            await fetchRoomUsers();

            if (isActive) {
              connectWebSocket();
            }
          }
        } catch (error) {
          console.error(i18n.t("room.loadDataError"), error);
          Alert.alert(i18n.t("room.error"), i18n.t("room.loadRoomDataError"));
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isActive = false;
        if (stompClient.current) {
          stompClient.current.deactivate();
        }
      };
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
                error instanceof Error ? error.message : i18n.t("room.removeUserError")
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
              Alert.alert(i18n.t("room.success"), i18n.t("room.postDeletedSuccess"));
            } catch (error) {
              Alert.alert(
                i18n.t("room.error"),
                error instanceof Error ? error.message : i18n.t("room.deletePostError")
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
              Alert.alert(i18n.t("room.success"), i18n.t("room.postDeletedSuccess"));
            } catch (error) {
              Alert.alert(
                i18n.t("room.error"),
                error instanceof Error ? error.message : i18n.t("room.deletePostError")
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
        <ActivityIndicator size="large" color="#16A34A" />
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
      source={require('../assets/background-photo.png')} 
      style={styles.container} 
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <ScrollView
        style={styles.content}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollToBottom()}
      >
        <HeaderWithNotifications 
          isRTL={isRTL}
          style={styles.topBar}
        />

        <View style={styles.infoCard}>
          <View style={styles.roomNameContainer}>
            {isEditing ? (
              <TextInput
                style={[styles.roomNameInput, textStyle]}
                value={editedName}
                onChangeText={setEditedName}
                autoFocus
              />
            ) : (
              <Text style={[styles.roomNameText, textStyle]}>{room.roomName}</Text>
            )}
          </View>

          <View style={[styles.detailRow, { flexDirection }]}>
            <Text style={styles.detailLabel}>{i18n.t("room.type")}:</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {room.type === "PUBLIC" ? i18n.t("room.public") : i18n.t("room.private")}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection }]}>
            <Text style={styles.detailLabel}>{i18n.t("room.owner")}:</Text>
            <Text style={[styles.detailValue, textStyle]}>
              {isOwner ? i18n.t("room.you") : `${i18n.t("room.user")} #${room.ownerId}`}
            </Text>
          </View>

          <View style={[styles.detailRow, { flexDirection }]}>
            <Text style={styles.detailLabel}>{i18n.t("room.roomCode")}:</Text>
            <Text style={[styles.detailValue, textStyle]}>{room.join_code}</Text>
            <TouchableOpacity onPress={copyRoomCode} style={styles.copyButton}>
              <Ionicons name="copy" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={[styles.detailRow, { flexDirection }]}>
            <Text style={styles.detailLabel}>{i18n.t("room.users")}:</Text>
            <View style={{ flex: 1 }}>
              {roomUsers.length === 0 ? (
                <Text style={[styles.detailValue, textStyle]}>
                  {i18n.t("room.noUsers")}
                </Text>
              ) : (
                roomUsers.map((user, index) => (
                  <View
                    key={`user-${user.userId}-${index}`}
                    style={[styles.userRow, { flexDirection }]}
                  >
                    <Text style={[styles.detailValue, textStyle]}>
                      {typeof user === "object" && user !== null
                        ? user.username || i18n.t("room.unknownUser")
                        : String(user)}
                      {user.userId === userId && ` (${i18n.t("room.you")})`}
                      {user.userId === room?.ownerId && ` (${i18n.t("room.owner")})`}
                    </Text>
                    {isOwner &&
                      user.userId !== userId &&
                      user.userId !== room?.ownerId && (
                        <TouchableOpacity
                          style={styles.removeUserButton}
                          onPress={() =>
                            handleRemoveUser(user.username || i18n.t("room.unknownUser"))
                          }
                        >
                          <Ionicons
                            name="person-remove"
                            size={16}
                            color="#ef4444"
                          />
                        </TouchableOpacity>
                      )}
                  </View>
                ))
              )}
            </View>
          </View>

          {isOwner && (
            <View style={[styles.actionsContainer, { flexDirection }]}>
              {isEditing ? (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                    disabled={isUpdating}
                  >
                    <Text style={styles.buttonText}>{i18n.t("room.cancel")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdateRoom}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>{i18n.t("room.save")}</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.buttonText}>{i18n.t("room.edit")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDeleteRoom}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.buttonText}>{i18n.t("room.delete")}</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, textStyle]}>{i18n.t("room.chat")}</Text>
        <View style={styles.chatContainer}>
          {messages.length === 0 ? (
            <Text style={[styles.emptyText, textStyle]}>{i18n.t("room.noMessages")}</Text>
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
                  {message.senderId === userId ? i18n.t("room.you") : message.senderName}
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

        <Text style={[styles.sectionTitle, textStyle]}>{i18n.t("room.posts")}</Text>
        {posts.length === 0 ? (
          <Text style={[styles.emptyText, textStyle]}>{i18n.t("room.noPosts")}</Text>
        ) : (
          posts.map((post) => (
            <View key={`post-${post.id}`} style={styles.postItem}>
              <TouchableOpacity
                onPress={() => handlePostPress(post.id)}
                style={styles.postContent}
              >
                <Text style={[styles.postTitle, textStyle]}>{post.title}</Text>
                <Text style={[styles.postContentText, textStyle]}>{post.content}</Text>
                <Text style={[styles.postAuthor, textStyle]}>
                  {i18n.t("room.by")}: {post.author?.username || i18n.t("room.unknownAuthor")}
                </Text>
                <Text style={[styles.postDate, textStyle]}>
                  {new Date(post.date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              <View style={[styles.postActions, { flexDirection }]}>
                <TouchableOpacity
                  style={styles.likeButton}
                  onPress={() => handleLike(post.id)}
                  disabled={likingPostIds.has(post.id)}
                >
                  {likingPostIds.has(post.id) ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons
                      name={post.isLikedByUser ? "heart" : "heart-outline"}
                      size={20}
                      color={post.isLikedByUser ? "#ef4444" : "#94a3b8"}
                    />
                  )}
                  <Text style={styles.likeCount}>{post.likes}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.commentButton}
                  onPress={() => handlePostPress(post.id)}
                >
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#94a3b8"
                  />
                  <Text style={styles.commentText}>{i18n.t("room.comment")}</Text>
                </TouchableOpacity>

                {post.author?.userId === userId && (
                  <TouchableOpacity
                    style={styles.ownerDeleteButton}
                    onPress={() => handleOwnerDeletePost(post.id, post.title)}
                    disabled={deletingPostIds.has(post.id)}
                  >
                    {deletingPostIds.has(post.id) ? (
                      <ActivityIndicator size="small" color="#f59e0b" />
                    ) : (
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#f59e0b"
                      />
                    )}
                  </TouchableOpacity>
                )}

                {userRole === "ADMIN" && (
                  <TouchableOpacity
                    style={styles.adminDeleteButton}
                    onPress={() => handleAdminDeletePost(post.id, post.title)}
                    disabled={deletingPostIds.has(post.id)}
                  >
                    {deletingPostIds.has(post.id) ? (
                      <ActivityIndicator size="small" color="#ef4444" />
                    ) : (
                      <Ionicons name="trash" size={20} color="#ef4444" />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.postForm}>
          <Text style={[styles.sectionTitle, textStyle]}>{i18n.t("room.createPost")}</Text>
          <TextInput
            style={[styles.input, textStyle]}
            placeholder={i18n.t("room.postTitlePlaceholder")}
            placeholderTextColor="#94a3b8"
            value={newPostTitle}
            onChangeText={setNewPostTitle}
          />
          <TextInput
            style={[styles.input, styles.textArea, textStyle]}
            placeholder={i18n.t("room.postContentPlaceholder")}
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
              <Text style={styles.buttonText}>{i18n.t("room.createPostButton")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.messageInputContainer}
      >
        <TextInput
          style={[styles.messageInput, textStyle]}
          placeholder={i18n.t("room.messagePlaceholder")}
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
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 18,
  },
  topBar: {
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  infoCard: {
    backgroundColor: "rgba(47, 53, 61, 0.8)",
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
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#94a3b8",
    fontWeight: "bold",
    minWidth: 80,
  },
  detailValue: {
    color: "white",
    flex: 1,
  },
  actionsContainer: {
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
  postItem: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
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
    flex: 1,
  },
  postContentText: {
    color: "#cbd5e1",
    marginBottom: 10,
  },
  postAuthor: {
    color: "#94a3b8",
    fontSize: 12,
    fontStyle: "italic",
  },
  postDate: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 5,
  },
  postForm: {
    marginTop: 20,
    marginBottom: 50,
  },
  input: {
    backgroundColor: "rgba(30, 41, 59, 0.8)",
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
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    color: "white",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
    backgroundColor: "#334155",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  postActions: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    flexWrap: "wrap",
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  likeCount: {
    color: "#94a3b8",
    marginLeft: 5,
    fontSize: 14,
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  removeUserButton: {
    padding: 4,
    marginLeft: 8,
  },
  adminDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  ownerDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    backgroundColor: "#1e293b",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  rtlText: {
    textAlign: "right",
  },
  ltrText: {
    textAlign: "left",
  },
  iconButton: {
    padding: 6,
  },
});