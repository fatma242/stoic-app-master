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
  Animated,
  Dimensions,
  StatusBar,
  Vibration,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { Video, ResizeMode } from "expo-av";
import { BlurView } from "expo-blur";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Message {
  id?: number;
  roomId: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams();
  const rid = roomId ? parseInt(roomId as string) : null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const stompClient = useRef<Client | null>(null);
  const messageAnimations = useRef<{ [key: string]: Animated.Value }>({});
  const connectionPulse = useRef(new Animated.Value(0.5)).current;
  const sendButtonScale = useRef(new Animated.Value(1)).current;
  const typingIndicator = useRef(new Animated.Value(0)).current;

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  // Connection pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(connectionPulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(connectionPulse, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Typing indicator animation
  useEffect(() => {
    if (isTyping) {
      const typing = Animated.loop(
          Animated.sequence([
            Animated.timing(typingIndicator, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(typingIndicator, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ])
      );
      typing.start();
      return () => typing.stop();
    }
  }, [isTyping]);

  useEffect(() => {
    AsyncStorage.getItem("userId").then((u) => {
      if (u) setUserId(parseInt(u));
    });
  }, []);

  // Fetch message history
  useEffect(() => {
    if (!rid) return;
    (async () => {
      try {
        const res = await fetch(
            `${API_BASE_URL}/api/messages/rooms/${rid}/history`,
            { credentials: "include" }
        );
        if (!res.ok) throw new Error();
        const msgs = await res.json();
        setMessages(msgs);

        // Initialize animations for existing messages
        msgs.forEach((msg: Message, index: number) => {
          const key = `msg-${msg.id ?? index}`;
          messageAnimations.current[key] = new Animated.Value(1);
        });
      } catch (err) {
        console.error(err);
      }
    })();
  }, [rid]);

  // WebSocket subscription
  useEffect(() => {
    if (rid && userId !== null) {
      const sock = new SockJS(`${API_BASE_URL}/ws-chat`);
      const client = new Client({
        webSocketFactory: () => sock,
        reconnectDelay: 5000,
        onConnect: () => {
          setIsConnected(true);
          client.subscribe(`/topic/rooms/${rid}`, (msg) => {
            const m = JSON.parse(msg.body) as Message;
            const key = `msg-${m.id ?? Date.now()}`;

            // Initialize animation for new message
            messageAnimations.current[key] = new Animated.Value(0);

            setMessages((prev) => [...prev, m]);

            // Animate new message
            Animated.spring(messageAnimations.current[key], {
              toValue: 1,
              useNativeDriver: true,
              tension: 100,
              friction: 8,
            }).start();

            // Haptic feedback for new messages
            if (m.senderId !== userId) {
              Vibration.vibrate(50);
            }

            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 100);
          });
        },
        onDisconnect: () => {
          setIsConnected(false);
        },
      });
      client.activate();
      stompClient.current = client;
      return () => void client.deactivate();
    }
  }, [rid, userId]);

  const sendMessage = useCallback(async () => {
    if (
        !newMessage.trim() ||
        !stompClient.current ||
        rid == null ||
        userId == null
    )
      return;

    // Button press animation
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsSending(true);
    setIsTyping(false);

    try {
      const dto = { content: newMessage, senderId: userId, roomId: rid };
      stompClient.current.publish({
        destination: `/app/chat.send/${rid}`,
        body: JSON.stringify(dto),
      });
      setNewMessage("");
      Vibration.vibrate(30);
    } catch {
      Alert.alert("Error", "Failed to send message");
      Vibration.vibrate([100, 50, 100]);
    } finally {
      setIsSending(false);
    }
  }, [newMessage, rid, userId]);

  const handleTyping = useCallback((text: string) => {
    setNewMessage(text);
    setIsTyping(text.length > 0);
  }, []);

  // Build render array with date separators
  const rendered: React.ReactNode[] = [];
  let lastDateKey: string | null = null;

  messages.forEach((msg, i) => {
    const date = new Date(msg.sentAt);
    const dayKey = date.toDateString();
    const messageKey = `msg-${msg.id ?? i}`;

    if (dayKey !== lastDateKey) {
      rendered.push(
          <View key={`sep-${i}`} style={styles.dateSeparatorContainer}>
            <BlurView intensity={20} tint="light" style={styles.dateSeparatorBlur}>
              <Text style={styles.dateSeparatorText}>
                {date.toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </BlurView>
          </View>
      );
      lastDateKey = dayKey;
    }

    const isMine = msg.senderId === userId;
    const timeOnly = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const messageAnimation = messageAnimations.current[messageKey] || new Animated.Value(1);

    rendered.push(
        <Animated.View
            key={messageKey}
            style={[
              styles.messageContainer,
              isMine ? styles.myMessageContainer : styles.otherMessageContainer,
              {
                opacity: messageAnimation,
                transform: [
                  {
                    scale: messageAnimation,
                  },
                  {
                    translateY: messageAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
        >
          <BlurView
              intensity={isMine ? 40 : 60}
              tint={isMine ? "dark" : "light"}
              style={[
                styles.messageBubble,
                isMine ? styles.myMessage : styles.otherMessage,
              ]}
          >
            {!isMine && (
                <Text style={styles.senderName}>{msg.senderName || "Unknown"}</Text>
            )}
            <Text style={styles.messageText}>{msg.content}</Text>
            <View style={styles.messageFooter}>
              <Text
                  style={[
                    styles.messageTime,
                    isMine ? styles.myMessageTime : styles.otherMessageTime,
                  ]}
              >
                {timeOnly}
              </Text>
              {isMine && (
                  <Ionicons
                      name="checkmark-done"
                      size={12}
                      color="rgba(255,255,255,0.6)"
                      style={styles.deliveryIcon}
                  />
              )}
            </View>
          </BlurView>
        </Animated.View>
    );
  });

  return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

        <Video
            source={require("../assets/background.mp4")}
            style={styles.backgroundVideo}
            rate={1.0}
            volume={0}
            isMuted
            resizeMode={ResizeMode.COVER}
            shouldPlay
            isLooping
        />

        <View style={styles.gradientOverlay} />

        {/* Modern Header */}
        <BlurView intensity={100} tint="dark" style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Room Chat</Text>
              <View style={styles.connectionStatus}>
                <Animated.View
                    style={[
                      styles.connectionDot,
                      { opacity: connectionPulse },
                      isConnected ? styles.connectedDot : styles.disconnectedDot,
                    ]}
                />
                <Text style={styles.connectionText}>
                  {isConnected ? "Connected" : "Connecting..."}
                </Text>
              </View>
            </View>


          </View>
        </BlurView>

        {/* Messages */}
        <ScrollView
            ref={scrollRef}
            style={styles.chatContainer}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
            }
        >
          {rendered.length ? (
              rendered
          ) : (
              <View >
                <BlurView intensity={20} tint="light" style={styles.emptyBlur}>
                  <Ionicons name="chatbubbles-outline" size={48} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.emptyText}>No messages yet</Text>
                  <Text style={styles.emptySubtext}>Start the conversation!</Text>
                </BlurView>
              </View>
          )}

         
          
        </ScrollView>

        {/* Modern Input */}
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.inputContainer}
        >
          <BlurView intensity={100} tint="dark">
            <View style={styles.inputRow}>
              <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={newMessage}
                    onChangeText={handleTyping}
                    placeholder="Type a message..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    multiline
                    maxLength={1000}
                    textAlignVertical="center"
                />

              </View>

              <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
                <TouchableOpacity
                    onPress={sendMessage}
                    disabled={isSending || !newMessage.trim()}
                    style={[
                      styles.sendBtn,
                      (!newMessage.trim() || isSending) && styles.sendBtnDisabled,
                    ]}
                >
                  {isSending ? (
                      <ActivityIndicator size="small" color="white" />
                  ) : (
                      <Ionicons name="send" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </BlurView>
        </KeyboardAvoidingView>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  header: {
    paddingTop: StatusBar.currentHeight || 50,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 20,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectedDot: {
    backgroundColor: "#10B981",
  },
  disconnectedDot: {
    backgroundColor: "#EF4444",
  },
  connectionText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontWeight: "500",
  },
  menuButton: {
    padding: 12,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexGrow: 1,
  },
  dateSeparatorContainer: {
    alignSelf: "center",
    marginVertical: 20,
  },
  dateSeparatorBlur: {
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  dateSeparatorText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  messageContainer: {
    marginBottom: 16,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  myMessage: {
    backgroundColor: "rgba(16, 185, 129, 0.9)",
    borderBottomRightRadius: 8,
  },
  otherMessage: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderBottomLeftRadius: 8,
  },
  senderName: {
    fontSize: 12,
    color: "#10B981",
    marginBottom: 6,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
    fontWeight: "400",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  messageTime: {
    fontSize: 11,
    fontWeight: "500",
  },
  myMessageTime: {
    color: "rgba(255,255,255,0.8)",
  },
  otherMessageTime: {
    color: "rgba(255,255,255,0.6)",
  },
  deliveryIcon: {
    marginLeft: 4,
  },
  typingContainer: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typingBubble: {
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  typingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontStyle: "italic",
  },
  // emptyContainer: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  emptyBlur: {
    borderRadius: 30,
    paddingVertical: 40,
    paddingHorizontal: 60,
    alignItems: "center",
    overflow: "hidden",
  },
  emptyText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    fontWeight: "400",
  },
  inputContainer: {
    borderTopWidth: 0.5,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  // inputBlur: {
  //   paddingBottom: Platform.OS === "ios" ? 34 : 20,
  // },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 30,
    marginRight: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    maxHeight: 100,
    fontWeight: "400",
    paddingVertical: 4,
  },
  attachButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendBtn: {
    backgroundColor: "#10B981",
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    // elevation: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  sendBtnDisabled: {
    backgroundColor: "rgba(255,255,255,0.2)",
    shadowOpacity: 0,
  },
});