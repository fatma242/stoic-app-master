import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const chatbotIcon = require('../../assets/chatbot.png');

const apiKey = Constants.expoConfig?.extra?.chatbotApiKey;
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ChatAI() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([]);
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

          try {
            const res = await fetch(`${API_BASE_URL}/api/users/status/${numericId}`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const responseText = await res.text();
            if (!responseText || responseText.trim() === '') {
              setUserStatus('NORMAL');
            } else {
              try {
                const data = JSON.parse(responseText);
                setUserStatus(data);
              } catch (parseError) {
                setUserStatus('NORMAL');
              }
            }
          } catch (statusError) {
            setUserStatus('NORMAL');
          }

          try {
            const ageRes = await fetch(`${API_BASE_URL}/api/users/age/${numericId}`);
            if (ageRes.ok) {
              const ageText = await ageRes.text();
              if (ageText && ageText.trim() !== '') {
                try {
                  const ageData = JSON.parse(ageText);
                  setUserAge(ageData);
                } catch (parseError) {}
              }
            }
          } catch (ageError) {}

          try {
            const genderRes = await fetch(`${API_BASE_URL}/api/users/gender/${numericId}`);
            if (genderRes.ok) {
              const genderData = await genderRes.text();
              setUserGender(genderData);
            }
          } catch (genderError) {}

          try {
            const historyRes = await fetch(`${API_BASE_URL}/api/chat/${numericId}`);
            if (historyRes.ok) {
              const historyText = await historyRes.text();
              if (historyText && historyText.trim() !== '') {
                try {
                  const history = JSON.parse(historyText);
                  const formatted = history.map((msg: any) => ({
                    _id: msg.id,
                    text: msg.content,
                    createdAt: new Date(msg.timestamp),
                    user: {
                      _id: msg.sender === 'USER' ? 1 : 2,
                      name: msg.sender === 'USER' ? 'You' : 'Stoic AI',
                      avatar: msg.sender === 'AI' ? chatbotIcon : undefined
                    },
                  }))
                      .sort((a: IMessage, b: IMessage) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                  setMessages(formatted);
                } catch (parseError) {
                  setMessages([]);
                }
              } else {
                setMessages([]);
              }
            } else {
              setMessages([]);
            }
          } catch (historyError) {
            setMessages([]);
          }
        }
      } catch (err) {
        setUserStatus('NORMAL');
      }
    };

    fetchUserInfo();
  }, []);

  const therapyKeywords = ['treatment', 'therapy', 'therapist', 'counseling', 'medication', 'doctor'];

  const saveMessageToBackend = async (sender: 'USER' | 'AI', content: string) => {
    if (!userId) return;

    try {
      await fetch(`${API_BASE_URL}/api/chat/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sender,
          content,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {}
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

    try {
      await saveMessageToBackend('USER', userMessage);
    } catch (error) {}

    if (therapyKeywords.some(keyword => userMessage.toLowerCase().includes(keyword))) {
      const botResponse = "I'm here as an AI life coach, not a substitute for professional psychological support. I recommend reaching out to a mental health professional or using resources like Shezlong or Befrienders. 🌼";

      try {
        await saveMessageToBackend('AI', botResponse);
      } catch (error) {}

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

      try {
        await saveMessageToBackend('AI', botResponse);
      } catch (saveError) {}

      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: botResponse,
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      }]));
    } catch (error) {
      const errText = "I'm having trouble connecting right now. Please try again later.";

      try {
        await saveMessageToBackend('AI', errText);
      } catch (saveError) {}

      setMessages(prev => GiftedChat.append(prev, [{
        _id: Math.random().toString(),
        text: errText,
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      }]));
    }
  }, [userStatus, userAge, userGender, messages]);

  return (
      <LinearGradient
          colors={["#0b240e", "#16361b", "#0b240e"]}
          style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={28} color="#10B981" />
          </TouchableOpacity>

          <View style={styles.botInfo}>
            <Image source={chatbotIcon} style={styles.avatar} />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Stoic AI</Text>
              <Text style={styles.headerStatus}>Active now</Text>
            </View>
          </View>
        </View>

        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            user={{ _id: 1 }}
            placeholder="Type your message..."
            alwaysShowSend
            renderAvatarOnTop
            renderBubble={props => (
                <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {
                        backgroundColor: '#10B981',
                        borderBottomRightRadius: 0,
                      },
                      left: {
                        backgroundColor: '#1E293B',
                        borderBottomLeftRadius: 0,
                      },
                    }}
                    textStyle={{
                      right: {
                        color: 'white',
                        fontSize: 15,
                      },
                      left: {
                        color: 'white',
                        fontSize: 15,
                      },
                    }}
                />
            )}
            renderInputToolbar={(props) => (
                <View style={styles.inputToolbar}>
                  <View style={styles.textInputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type your message..."
                        placeholderTextColor="#94a3b8"
                        value={props.text}
                        onChangeText={props.onTextChanged}
                        multiline
                    />
                  </View>
                  <TouchableOpacity
                      style={styles.sendButton}
                      onPress={() => props.onSend && props.onSend({ text: props.text?.trim() }, true)}
                  >
                    <Ionicons name="send" size={24} color="#10B981" />
                  </TouchableOpacity>
                </View>
            )}
            messagesContainerStyle={{
              backgroundColor: 'rgba(10, 23, 43, 0.5)',
              paddingBottom: 10,
            }}
        />
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(10, 23, 43, 0.5)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 184, 128, 0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  botInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F0FDF4'
  },
  headerStatus: {
    fontSize: 13,
    color: '#10B981',
    marginTop: 2,
  },
  inputToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(10, 23, 43, 0.7)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(20, 184, 128, 0.1)',
  },
  textInputContainer: {
    flex: 1,
    marginRight: 10,
  },
  textInput: {
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    borderRadius: 25,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: '#F0FDF4',
    maxHeight: 100,
    minHeight: 50,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 128, 0.2)',
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});