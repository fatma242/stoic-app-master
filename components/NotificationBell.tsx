import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../app/Notification';

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
  const { unreadCount, isConnected } = useNotifications();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const connectionAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for new notifications
  useEffect(() => {
    if (unreadCount > 0) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      return () => pulse.stop();
    }
  }, [unreadCount]);

  // Connection status animation
  useEffect(() => {
    Animated.timing(connectionAnim, {
      toValue: isConnected ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isConnected]);

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <Ionicons name="notifications" size={size} color={color} />
        
        {/* Connection status indicator */}
        <Animated.View 
          style={[
            styles.connectionIndicator,
            {
              opacity: connectionAnim,
              backgroundColor: isConnected ? '#16A34A' : '#EF4444'
            }
          ]} 
        />
      </Animated.View>
      
      {unreadCount > 0 && (
        <Animated.View style={[styles.badge, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  connectionIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'white',
  },
});