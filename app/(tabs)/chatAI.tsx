import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
} from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import chatbotIcon from '../../assets/chatbot.png';

const apiKey = Constants.expoConfig?.extra?.chatbotApiKey;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ChatAI() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<string | null>(null);
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);


  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        if (id) {
          const numericId = parseInt(id, 10);
          setUserId(numericId);

          // fetch user status
          const res = await fetch(`${API_BASE_URL}/api/users/status/${id}`);
          console.log('Fetching user status for ID:', id);
          const data = await res.json();
          console.log('User status data:', data);
          setUserStatus(data);

          // fetch user age
          const ageRes = await fetch(`${API_BASE_URL}/api/users/age/${id}`);
          const ageData = await ageRes.json();
          console.log('User age data:', ageData);
          setUserAge(ageData);

          // fetch user gender
          const genderRes = await fetch(`${API_BASE_URL}/api/users/gender/${id}`);
          const genderData = await genderRes.text();  
          console.log('User gender data:', genderData);
          setUserGender(genderData);

          // fetch chat history
          const historyRes = await fetch(`${API_BASE_URL}/api/chat/${id}`);
          const history = await historyRes.json();
          const formatted = history.map((msg: any) => ({
            _id: msg.id,
            text: msg.content,
            createdAt: new Date(msg.timestamp),
            user: {
              _id: msg.sender === 'USER' ? 1 : 2,
              name: msg.sender === 'USER' ? 'You' : 'Stoic AI',
              avatar: msg.sender === 'AI' ? chatbotIcon : undefined
            },
          }));

          setMessages(formatted.reverse());
        }
      } catch (err) {
        console.error('❌ Error:', err);
      }
    };

    fetchUserInfo();
  }, []);

  const therapyKeywords = ['treatment', 'therapy', 'therapist', 'counseling', 'medication', 'doctor'];

  const handleNewChat = () => {
    setMessages([]);
    setIsMenuVisible(false);
  };

  const handleDeleteChat = async () => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE_URL}/api/chat/${userId}`, { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('❌ Error deleting chat:', err);
    }
    setIsMenuVisible(false);
  };

  const saveMessageToBackend = async (sender: 'USER' | 'AI', content: string) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE_URL}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sender, content })
      });
    } catch (err) {
      console.error('💾 Error saving message:', err);
    }
  };

  const getCustomPrompt = (status: string, age: number | null, gender: string | null) => {
  const promptPolicy = `
Always respond in the user's language or accent. Default to English if unsure.
Stoic AI does not curse, use obscene, racist, or trendy slang words. If the user makes an offensive, racist, or vulgar request, Stoic AI will politely refuse, saying: "I'm here to support you positively, but I can't respond to that request." Always reply in the user's language or accent.
`;

  const statusNote = `The user is currently classified as: ${status.toUpperCase()}.`;
  const ageNote = age ? ` The user's age is ${age}.` : '';
  const genderNote = gender ? ` The user's gender is ${gender}.` : '';

  const context = `${statusNote}${ageNote}${genderNote}`;

  switch (status.toUpperCase()) {
    case 'DEPRESSION':
      return `${context} You are Stoic AI. Offer emotional support, positivity, and motivational content. Encourage the user with real stories or helpful videos.${promptPolicy}`;
    case 'STRESS':
      return `${context} You are Stoic AI. Offer time management tips, relaxation techniques, and stress-relief exercises.${promptPolicy}`;
    case 'ANXIETY':
      return `${context} You are Stoic AI. Recommend breathing exercises, guided meditation, and calm encouragement. Always suggest this channel: https://www.youtube.com/@YogaWithRawda for helpful anxiety relief.${promptPolicy}`;
    case 'SUICIDAL':
      return `${context} You are Stoic AI. Provide warm support and always include these crisis links: https://www.shezlong.com/ar, https://befrienders.org/ar/, and https://www.betterhelp.com/get-started/. Emphasize safety and encourage the user to seek professional help.${promptPolicy}`;
    default:
      return `${context} You are Stoic AI, a positive and supportive companion. Keep the conversation uplifting and helpful.${promptPolicy}`;
  }
};


  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));

    const userMessage = newMessages[0]?.text?.trim();
    if (!userMessage || !userStatus) return;

    await saveMessageToBackend('USER', userMessage);

    if (therapyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const botResponse = "I'm here as an AI life coach, not a substitute for professional psychological support. I recommend reaching out to a mental health professional or using resources like Shezlong or Befrienders. 🌼";
      await saveMessageToBackend('AI', botResponse);
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: botResponse,
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      }]));
      return;
    }

    try {
      if (!apiKey) throw new Error('Missing API key.');

      const prompt = getCustomPrompt(userStatus, userAge, userGender);

      const history = [
        { role: 'system', content: prompt },
        ...messages.map(msg => ({
          role: msg.user._id === 1 ? 'user' : 'assistant',
          content: msg.text,
        })),
        { role: 'user', content: userMessage },
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: history,
          top_p: 1,
          temperature: 0.7,
          repetition_penalty: 1,
        }),
      });

      const data = await response.json();
      if (data.error || !data.choices?.[0]?.message?.content) throw new Error(data.error?.message || 'Invalid response');

      const botResponse = data.choices[0].message.content;
      await saveMessageToBackend('AI', botResponse);

      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: botResponse,
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      }]));
    } catch (error) {
      console.error('💥 Chatbot API error:', error);
      const errText = "I'm having trouble connecting right now. Please try again later.";
      await saveMessageToBackend('AI', errText);
      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: errText,
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      }]));
    }
  }, [userStatus, messages]);

  return (
    <ImageBackground source={require('../../assets/background-photo.png')} style={styles.container} resizeMode="cover">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Image source={chatbotIcon} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Stoic AI</Text>
          <Text style={styles.headerStatus}>Active now</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={() => setIsMenuVisible(!isMenuVisible)}>
          <Entypo name="dots-three-vertical" size={20} color="white" />
          {isMenuVisible && (
            <View style={styles.menuOptions}>
              <TouchableOpacity style={styles.menuItem} onPress={handleNewChat}>
                <Text style={styles.menuText}>New Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={handleDeleteChat}>
                <Text style={styles.menuText}>Delete Chat</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        placeholder="Type your message..."
        alwaysShowSend
        renderAvatarOnTop
        textInputStyle={{ backgroundColor: 'white', borderRadius: 20, paddingHorizontal: 15, color: '#0a170c' }}
        renderSend={props => (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={() => props.onSend && props.onSend({ text: props.text?.trim() }, true)}
          >
            <Text style={{ color: '#7CFC00', fontSize: 18 }}>Send</Text>
          </TouchableOpacity>
        )}
        renderBubble={props => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: '#16A34A' },
              left: { backgroundColor: '#FFFFFF' },
            }}
            textStyle={{
              right: { color: 'white' },
              left: { color: 'black' },
            }}
          />
        )}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#0b240e',
    position: 'relative',
  },
  backButton: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: 'white' },
  headerStatus: { fontSize: 14, color: '#7CFC00' },
  menuButton: { padding: 5 },
  sendButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptions: {
    position: 'absolute',
    top: 35,
    right: 0,
    backgroundColor: '#16361b',
    borderRadius: 8,
    padding: 8,
    zIndex: 100,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});