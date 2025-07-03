import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ImageBackground,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '@stomp/stompjs';

// Type definitions
export interface Notification {
  id: number;
  title?: string;
  message?: string;
  content?: string; // Backend might send 'content' instead of 'message'
  type: 'ROOM_INVITATION' | 'USER_JOINED' | 'POST_CREATED' | 'COMMENT_ADDED' | 'SYSTEM_UPDATE' | 'REMINDER' | 'ACHIEVEMENT';
  isRead: boolean;
  read?: boolean; // Backend might send 'read' instead of 'isRead'
  createdAt: string;
  user?: {
    userId: number;
    username: string;
  };
}

export interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (notificationId: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: number) => void;
  fetchNotifications: () => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  isConnected?: boolean; // Add connection status
}

// Notification Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const stompClient = useRef<Client | null>(null);
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  // Get user ID on component mount
  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        }
      } catch (error) {
        console.error('❌ Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  // Initialize notification system when userId is available
  useEffect(() => {
    if (userId) {
      fetchNotifications();
      connectWebSocket();
      startPolling();
    }
    return () => {
      disconnectWebSocket();
      stopPolling();
    };
  }, [userId]);

  // Real-time WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!userId || (stompClient.current && stompClient.current.connected)) return;

    try {
      console.log('🔌 Connecting to WebSocket for real-time notifications...');
      console.log(`WebSocket URL: ${API_BASE_URL}/ws-chat`);

      const socket = new (require('sockjs-client'))(`${API_BASE_URL}/ws-chat`);
      stompClient.current = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        
        onConnect: () => {
          console.log('🚀 WebSocket connected for real-time notifications');
          setIsConnected(true);
          
          // Subscribe to user-specific notifications
          stompClient.current?.subscribe(
            `/topic/notifications/${userId}`,
            (message) => {
              try {
                const newNotification: Notification = JSON.parse(message.body);
                console.log('📢 Real-time notification received:', newNotification);
                
                // Normalize the notification data
                const normalizedNotification = {
                  ...newNotification,
                  title: newNotification.title || 'Notification',
                  message: newNotification.message || newNotification.content || 'No content',
                  isRead: newNotification.isRead !== undefined ? newNotification.isRead : newNotification.read || false,
                };
                
                addNotification(normalizedNotification);
              } catch (error) {
                console.error('❌ Error parsing real-time notification:', error);
              }
            }
          );

          // Subscribe to notification read updates
          stompClient.current?.subscribe(
            `/topic/notifications/${userId}/read`,
            (message) => {
              try {
                const notificationId = parseInt(message.body);
                console.log('✅ Real-time read update for notification:', notificationId);
                handleRealTimeReadUpdate(notificationId);
              } catch (error) {
                console.error('❌ Error processing read update:', error);
              }
            }
          );

          // Subscribe to mark all as read updates
          stompClient.current?.subscribe(
            `/topic/notifications/${userId}/read-all`,
            () => {
              console.log('✅ Real-time mark all as read received');
              handleRealTimeMarkAllRead();
            }
          );

          // Subscribe to notification deletions
          stompClient.current?.subscribe(
            `/topic/notifications/${userId}/deleted`,
            (message) => {
              try {
                const notificationId = parseInt(message.body);
                console.log('🗑️ Real-time delete for notification:', notificationId);
                handleRealTimeDelete(notificationId);
              } catch (error) {
                console.error('❌ Error processing delete update:', error);
              }
            }
          );
        },
        
        onStompError: (frame) => {
          console.error('❌ WebSocket STOMP error:', frame.headers['message']);
          setIsConnected(false);
        },
        
        onDisconnect: () => {
          console.log('📴 WebSocket disconnected');
          setIsConnected(false);
        },
        
        onWebSocketError: (event) => {
          console.error('❌ WebSocket error:', event);
          setIsConnected(false);
        }
      });

      stompClient.current.activate();
    } catch (error) {
      console.error('❌ Error connecting to WebSocket:', error);
      setIsConnected(false);
    }
  }, [userId]);

  const disconnectWebSocket = useCallback(() => {
    if (stompClient.current) {
      try {
        stompClient.current.deactivate();
        stompClient.current = null;
        setIsConnected(false);
        console.log('📴 WebSocket disconnected');
      } catch (error) {
        console.error('❌ Error disconnecting WebSocket:', error);
      }
    }
  }, []);

  // Polling fallback for when WebSocket is not available
  const startPolling = useCallback(() => {
    if (pollingInterval.current) return;
    
    pollingInterval.current = setInterval(() => {
      if (!isConnected) {
        console.log('🔄 Polling for notifications (WebSocket not connected)');
        fetchNotifications();
      }
    }, 30000); // Poll every 30 seconds when WebSocket is down
    
    console.log('⏱️ Started notification polling fallback');
  }, [isConnected]);

  const stopPolling = useCallback(() => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
      console.log('⏹️ Stopped notification polling');
    }
  }, []);

  // Real-time update handlers
  const handleRealTimeReadUpdate = useCallback((notificationId: number) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const handleRealTimeMarkAllRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const handleRealTimeDelete = useCallback((notificationId: number) => {
    setNotifications(prev => {
      const deletedNotification = prev.find(n => n.id === notificationId);
      const filtered = prev.filter(n => n.id !== notificationId);
      
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      return filtered;
    });
  }, []);

  // Enhanced fetch notifications with better error handling
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      console.log(`📬 Fetching notifications for user ${userId}...`);
      const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      console.log(`📬 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }

      const data: Notification[] = await response.json();
      console.log(`📬 Fetched ${data.length} notifications`);
      
      // Normalize the notification data to handle different field names from backend
      const normalizedData = data.map(notification => ({
        ...notification,
        title: notification.title || 'Notification',
        message: notification.message || notification.content || 'No content',
        isRead: notification.isRead !== undefined ? notification.isRead : notification.read || false,
      }));
      
      setNotifications(normalizedData);
      setUnreadCount(normalizedData.filter(n => !n.isRead).length);
      console.log(`📬 Set ${normalizedData.length} notifications, ${normalizedData.filter(n => !n.isRead).length} unread`);
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      
      // If WebSocket is not connected, ensure polling continues
      if (!isConnected) {
        startPolling();
      }
    }
  }, [userId, isConnected]);

  // Enhanced addNotification with duplicate prevention
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => {
      // Check for duplicates based on ID or timestamp
      const isDuplicate = prev.some(n => 
        n.id === notification.id || 
        (n.title === notification.title && 
         n.message === notification.message && 
         Math.abs(new Date(n.createdAt).getTime() - new Date(notification.createdAt).getTime()) < 5000)
      );
      
      if (isDuplicate) {
        console.log('🔄 Duplicate notification detected, skipping');
        return prev;
      }
      
      console.log('📬 Adding new notification:', notification.title);
      return [notification, ...prev];
    });
    
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Rest of your existing functions (markAsRead, markAllAsRead, deleteNotification)
  const markAsRead = useCallback(async (notificationId: number) => {
    if (!userId) return;

    // Optimistic update
    handleRealTimeReadUpdate(notificationId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read/${userId}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Revert optimistic update on error
        fetchNotifications();
        throw new Error('Failed to mark notification as read');
      }

      console.log(`✅ Marked notification ${notificationId} as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    // Optimistic update
    handleRealTimeMarkAllRead();

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${userId}/read-all`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Revert optimistic update on error
        fetchNotifications();
        throw new Error('Failed to mark all notifications as read');
      }

      console.log('✅ Marked all notifications as read');
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
    }
  }, [userId]);

  const deleteNotification = useCallback(async (notificationId: number) => {
    if (!userId) return;

    // Optimistic update
    handleRealTimeDelete(notificationId);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/notifications/${notificationId}/${userId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        // Revert optimistic update on error
        fetchNotifications();
        throw new Error('Failed to delete notification');
      }

      console.log(`🗑️ Deleted notification ${notificationId}`);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }, [userId]);

  // Force refresh function for manual refresh
  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing notifications...');
    await fetchNotifications();
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications: forceRefresh,
    connectWebSocket,
    disconnectWebSocket,
    isConnected, // Add connection status
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Notification Bell Component
interface NotificationBellProps {
  onPress: () => void;
  color?: string;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ 
  onPress, 
  color = 'white', 
  size = 24 
}) => {
  const { unreadCount } = useNotifications();

  return (
    <TouchableOpacity onPress={onPress} style={bellStyles.container}>
      <Ionicons name="notifications" size={size} color={color} />
      {unreadCount > 0 && (
        <View style={bellStyles.badge}>
          <Text style={bellStyles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const bellStyles = StyleSheet.create({
  container: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onPress 
}) => {
  const { markAsRead, deleteNotification } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'ROOM_INVITATION':
        return 'people';
      case 'USER_JOINED':
        return 'person-add';
      case 'POST_CREATED':
        return 'document-text';
      case 'COMMENT_ADDED':
        return 'chatbubble';
      case 'SYSTEM_UPDATE':
        return 'settings';
      case 'REMINDER':
        return 'alarm';
      case 'ACHIEVEMENT':
        return 'trophy';
      default:
        return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'ROOM_INVITATION':
        return '#3b82f6';
      case 'USER_JOINED':
        return '#10b981';
      case 'POST_CREATED':
        return '#8b5cf6';
      case 'COMMENT_ADDED':
        return '#f59e0b';
      case 'SYSTEM_UPDATE':
        return '#6b7280';
      case 'REMINDER':
        return '#ef4444';
      case 'ACHIEVEMENT':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    onPress?.();
  };

  const handleDelete = () => {
    deleteNotification(notification.id);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Unknown time';
      }
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInHours * 60);
        return diffInMinutes <= 0 ? 'Just now' : `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
          return 'Yesterday';
        } else if (diffInDays < 7) {
          return `${diffInDays}d ago`;
        } else {
          // Show actual date for older notifications
          return date.toLocaleDateString();
        }
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  return (
    <TouchableOpacity
      style={[
        itemStyles.container,
        notification.isRead ? itemStyles.read : itemStyles.unread
      ]}
      onPress={handleMarkAsRead}
    >
      <View style={[
        itemStyles.iconContainer,
        notification.isRead ? itemStyles.readIconContainer : itemStyles.unreadIconContainer
      ]}>
        <Ionicons
          name={getIcon(notification.type)}
          size={24}
          color={getIconColor(notification.type)}
        />
      </View>

      <View style={itemStyles.content}>
        <Text style={[
          itemStyles.title,
          notification.isRead ? itemStyles.readTitle : itemStyles.unreadTitle
        ]} numberOfLines={1}>
          {notification.title || 'Notification'}
        </Text>
        <Text style={[
          itemStyles.message,
          notification.isRead ? itemStyles.readMessage : itemStyles.unreadMessage
        ]} numberOfLines={2}>
          {notification.message || notification.content || 'No content available'}
        </Text>
        <Text style={[
          itemStyles.time,
          notification.isRead ? itemStyles.readTime : itemStyles.unreadTime
        ]}>
          {formatDate(notification.createdAt)}
        </Text>
      </View>

      <View style={itemStyles.actions}>
        {!notification.isRead && <View style={itemStyles.unreadDot} />}
        <TouchableOpacity
          onPress={handleDelete}
          style={itemStyles.deleteButton}
        >
          <Ionicons 
            name="close" 
            size={20} 
            color={notification.isRead ? "#475569" : "#64748b"} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const itemStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  read: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker for read notifications
  },
  unread: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Lighter for unread notifications
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  readIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Darker for read notifications
  },
  unreadIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Brighter for unread notifications
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  readTitle: {
    color: '#94a3b8', // Darker color for read notifications
  },
  unreadTitle: {
    color: 'white', // Brighter color for unread notifications
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  readMessage: {
    color: '#64748b', // Darker color for read notifications
  },
  unreadMessage: {
    color: '#cbd5e1', // Brighter color for unread notifications
  },
  time: {
    fontSize: 12,
  },
  readTime: {
    color: '#475569', // Darker color for read notifications
  },
  unreadTime: {
    color: '#64748b', // Slightly brighter for unread notifications
  },
  actions: {
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 8,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A', // Changed to green to match app theme
    marginBottom: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  deleteButton: {
    padding: 4,
  },
});

// Main Notifications Screen
const NotificationsScreen = () => {
  const router = useRouter();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    fetchNotifications,
    isConnected 
  } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount > 0) {
      Alert.alert(
        'Mark All as Read',
        `Mark all ${unreadCount} notifications as read?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Mark All', onPress: markAllAsRead },
        ]
      );
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <NotificationItem notification={item} />
  );

  const renderConnectionStatus = () => (
    <View style={styles.connectionStatus}>
      <View style={[
        styles.connectionDot, 
        { backgroundColor: isConnected ? '#16A34A' : '#EF4444' }
      ]} />
      <Text style={styles.connectionText}>
        {isConnected ? 'Real-time updates active' : 'Offline mode - Pull to refresh'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color="#64748b" />
      <Text style={styles.emptyTitle}>No Notifications</Text>
      <Text style={styles.emptyMessage}>
        You're all caught up! New notifications will appear here automatically.
      </Text>
      {renderConnectionStatus()}
    </View>
  );

  return (
    <ImageBackground 
      source={require('../assets/background-photo.png')} 
      style={styles.container} 
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Notifications</Text>
        
        <TouchableOpacity 
          onPress={handleMarkAllAsRead}
          style={styles.markAllButton}
          disabled={unreadCount === 0}
        >
          <Ionicons 
            name="checkmark-done" 
            size={24} 
            color={unreadCount > 0 ? "white" : "#64748b"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <Text style={styles.totalText}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.statusContainer}>
            {unreadCount > 0 && (
              <Text style={styles.unreadText}>
                {unreadCount} unread
              </Text>
            )}
            {renderConnectionStatus()}
          </View>
        </View>

        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => `notification-${item.id}`}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="white"
              colors={['#16A34A']}
              title="Pull to refresh notifications"
              titleColor="white"
            />
          }
          style={styles.list}
          showsVerticalScrollIndicator={false}
          // Auto-scroll to top when new notifications arrive
          onContentSizeChange={() => {
            if (notifications.length > 0) {
              // Auto scroll to top when new notifications come in
            }
          }}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: 'rgba(11, 36, 14, 0.8)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  markAllButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
  },
  totalText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  unreadText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 64,
  },
  emptyTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    marginTop: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  connectionText: {
    color: '#94a3b8',
    fontSize: 12,
    fontStyle: 'italic',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
});

// Export the NotificationsScreen as default for Expo Router
export default NotificationsScreen;