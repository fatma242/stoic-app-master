import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

const API_BASE_URL = 'http://192.168.1.6:8100';

export default function EditProfile() {
  const navigation = useNavigation();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('userEmail');
        const userID = await AsyncStorage.getItem('userId');
        if (!storedEmail) return;

        const response = await fetch(`${API_BASE_URL}/api/users`, {
          credentials: 'include' // ✅ send session cookie
        });
        const users = await response.json();
        const currentUser = users.find((u: any) => u.id === userID);
        console.log('Fetched user:', currentUser.username, currentUser.email);
        if (currentUser) {
          setUser(currentUser);
          setName(currentUser.username);
          setEmail(currentUser.email);

          if (currentUser.userId !== undefined) {
            console.log('✅ Storing userId:', currentUser.userId);
            await AsyncStorage.setItem('userId', String(currentUser.userId));
          } else {
            console.log('❌ userId is missing in currentUser');
            Alert.alert('Error', 'User ID is missing in fetched data.');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Validation', 'Username and email cannot be empty.');
      return;
    }

    const allowedDomains = ['.com', '.org', '.edu']; // add more if needed
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

    const domain = email.slice(email.lastIndexOf('.'));

    // Check format and allowed domain
    if (!emailRegex.test(email) || !allowedDomains.includes(domain)) {
      Alert.alert('Validation', 'Please enter a valid email ending with .com, .org, or .edu');
      return;
    }

    if (newPassword.trim() && newPassword.length < 6) {
      Alert.alert('Validation', 'Password must be at least 6 characters.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'User ID is missing.');
        return;
      }

      const body: any = {
        username: name,
        email,
        userRole: user?.userRole || 'REG',
        password: newPassword.trim() ? newPassword : user?.password,
      };

      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error();

      await AsyncStorage.setItem('userEmail', email);
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../assets/background.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
      <View style={styles.overlay} />
      <View style={styles.innerContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Edit Profile</Text>

        <TextInput
          style={styles.input}
          value={name}
          placeholder="Username"
          placeholderTextColor="#999"
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          value={email}
          placeholder="Email"
          placeholderTextColor="#999"
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          value={newPassword}
          placeholder="New Password (optional)"
          placeholderTextColor="#999"
          secureTextEntry
          onChangeText={setNewPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleUpdate}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: 'relative' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  innerContainer: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { width: 80, height: 80, alignSelf: 'center', marginBottom: 20 },
  title: {
    fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 30, color: '#fff',
  },
  input: {
    borderWidth: 1, borderColor: '#16a34a', borderRadius: 10,
    padding: 12, marginBottom: 15, backgroundColor: '#fff', color: '#000',
  },
  button: {
    backgroundColor: '#16a34a', padding: 15, borderRadius: 10, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontSize: 16, fontWeight: '600',
  },
});
