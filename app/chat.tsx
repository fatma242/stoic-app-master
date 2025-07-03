import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { Video, ResizeMode } from 'expo-av';
import { HeaderWithNotifications } from '../components/HeaderWithNotifications';

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
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    const scrollRef = useRef<ScrollView>(null);
    const stompClient = useRef<Client | null>(null);
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;


    useEffect(() => {
        AsyncStorage.getItem('userId').then(u => {
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
                    { credentials: 'include' }
                );
                if (!res.ok) throw new Error();
                setMessages(await res.json());
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
                    client.subscribe(`/topic/rooms/${rid}`, msg => {
                        const m = JSON.parse(msg.body) as Message;
                        setMessages(prev => [...prev, m]);
                        scrollRef.current?.scrollToEnd({ animated: true });
                    });
                },
            });
            client.activate();
            stompClient.current = client;
            return () => void client.deactivate();
        }
    }, [rid, userId]);

    const sendMessage = useCallback(async () => {
        if (!newMessage.trim() || !stompClient.current || rid == null || userId == null)
            return;
        setIsSending(true);
        try {
            const dto = { content: newMessage, senderId: userId, roomId: rid };
            stompClient.current.publish({
                destination: `/app/chat.send/${rid}`,
                body: JSON.stringify(dto),
            });
            setNewMessage('');
        } catch {
            Alert.alert('Error', 'Failed to send message');
        } finally {
            setIsSending(false);
        }
    }, [newMessage, rid, userId]);

    // Build render array with date separators
    const rendered: React.ReactNode[] = [];
    let lastDateKey: string | null = null;

    messages.forEach((msg, i) => {
        const date = new Date(msg.sentAt);
        const dayKey = date.toDateString();
        if (dayKey !== lastDateKey) {
            rendered.push(
                <View key={`sep-${i}`} style={styles.dateSeparatorContainer}>
                    <Text style={styles.dateSeparatorText}>
                        {date.toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </Text>
                </View>
            );
            lastDateKey = dayKey;
        }

        const isMine = msg.senderId === userId;
        const timeOnly = date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });

        rendered.push(
            <View
                key={`msg-${msg.id ?? i}`}
                style={[
                    styles.messageContainer,
                    isMine ? styles.myMessageContainer : styles.otherMessageContainer,
                ]}>
                <View style={[
                    styles.messageBubble,
                    isMine ? styles.myMessage : styles.otherMessage,
                ]}>
                    {!isMine && (
                        <Text style={styles.senderName}>
                            {msg.senderName || 'Unknown'}
                        </Text>
                    )}
                    <Text style={styles.messageText}>{msg.content}</Text>
                    <Text style={[
                        styles.messageTime,
                        isMine ? styles.myMessageTime : styles.otherMessageTime
                    ]}>
                        {timeOnly}
                    </Text>
                </View>
            </View>
        );
    });

    return (
        <View style={styles.container}>
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

            {/* Header */}
            <HeaderWithNotifications style={styles.header} />
            <Text style={styles.headerTitle}>Room Chat</Text>

            {/* Messages */}
            <ScrollView
                ref={scrollRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                {rendered.length ? (
                    rendered
                ) : (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No messages yet</Text>
                        <Text style={styles.emptySubtext}>Start the conversation!</Text>
                    </View>
                )}
            </ScrollView>

            {/* Input */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.inputContainer}>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type a message..."
                        placeholderTextColor="rgba(255,255,255,0.6)"
                        multiline
                        maxLength={1000}
                    />
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={isSending || !newMessage.trim()}
                        style={[
                            styles.sendBtn,
                            (!newMessage.trim() || isSending) && styles.sendBtnDisabled
                        ]}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <Ionicons name="send" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
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
        backgroundColor: "rgba(0,0,0,0.4)",
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
    },
    headerSpacer: {
        width: 40,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        flexGrow: 1,
    },
    dateSeparatorContainer: {
        alignSelf: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 15,
        marginVertical: 15,
    },
    dateSeparatorText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '500',
    },
    messageContainer: {
        marginBottom: 12,
    },
    myMessageContainer: {
        alignItems: 'flex-end',
    },
    otherMessageContainer: {
        alignItems: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    myMessage: {
        backgroundColor: '#16A34A',
        borderBottomRightRadius: 4,
    },
    otherMessage: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderBottomLeftRadius: 4,
    },
    senderName: {
        fontSize: 12,
        color: 'rgba(67,255,10,0.8)',
        marginBottom: 4,
        fontWeight: '700',
    },
    messageText: {
        fontSize: 16,
        color: '#fff',
        lineHeight: 20,
    },
    messageTime: {
        fontSize: 11,
        marginTop: 6,
        fontWeight: '400',
    },
    myMessageTime: {
        color: 'rgba(255,255,255,0.8)',
        alignSelf: 'flex-end',
    },
    otherMessageTime: {
        color: 'rgba(255,255,255,0.6)',
        alignSelf: 'flex-end',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        color: 'rgba(255,255,255,0.6)',
        fontSize: 14,
    },
    inputContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        color: 'white',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 12,
        fontSize: 16,
        maxHeight: 100,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    sendBtn: {
        backgroundColor: '#16A34A',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#16A34A',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.4,
        shadowRadius: 4,
        elevation: 5,
    },
    sendBtnDisabled: {
        backgroundColor: 'rgba(255,255,255,0.3)',
        shadowOpacity: 0,
    },
});