import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NotificationBell } from '../app/Notification';

interface HeaderWithNotificationsProps {
  showBackButton?: boolean;
  onBackPress?: () => void;
  backButtonColor?: string;
  notificationBellColor?: string;
  notificationBellSize?: number;
  style?: any;
  isRTL?: boolean;
}

export const HeaderWithNotifications: React.FC<HeaderWithNotificationsProps> = ({
  showBackButton = true,
  onBackPress,
  backButtonColor = 'white',
  notificationBellColor = 'white',
  notificationBellSize = 24,
  style,
  isRTL = false,
}) => {
  const router = useRouter();

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    router.push('/Notification');
  };

  const flexDirection = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[styles.container, { flexDirection }, style]}>
      {showBackButton && (
        <TouchableOpacity onPress={handleBackPress} style={styles.button}>
          <Ionicons 
            name={isRTL ? "arrow-forward" : "arrow-back"} 
            size={24} 
            color={backButtonColor} 
          />
        </TouchableOpacity>
      )}

      <NotificationBell 
        onPress={handleNotificationPress}
        color={notificationBellColor}
        size={notificationBellSize}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50, // Account for status bar
  },
  button: {
    padding: 4,
  },
});
