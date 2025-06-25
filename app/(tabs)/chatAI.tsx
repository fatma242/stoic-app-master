import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground, Alert } from 'react-native';
import { GiftedChat, IMessage, Bubble } from 'react-native-gifted-chat';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import Constants from 'expo-constants';
import chatbotIcon from '../../assets/chatbot.png';

const apiKey = Constants.expoConfig?.extra?.chatbotApiKey;
const therapyKeywords = ['treatment', 'therapy', 'therapist', 'counseling', 'medication', 'doctor'];

export default function ChatAI() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([
    {
      _id: 1,
      text: 'Hello! How are you feeling today? 😊',
      createdAt: new Date(),
      user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
    },
  ]);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleNewChat = () => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! How are you feeling today? 😊',
        createdAt: new Date(),
        user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
      },
    ]);
    setIsMenuVisible(false);
  };

  const handleDeleteChat = () => {
    setMessages([]);
    setIsMenuVisible(false);
  };

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    const userMessage = newMessages[0]?.text?.toLowerCase();

    if (!userMessage) return;

    // Handle therapy warning
    if (therapyKeywords.some(keyword => userMessage.includes(keyword))) {
      const botResponse = "I'm here as an AI life coach, not a substitute for professional psychological support. I recommend reaching out to a mental health professional or using resources like Shezlong (https://www.shezlong.com/ar) or Befrienders (https://befrienders.org/ar/). 🌼";
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          {
            _id: Math.random().toString(),
            text: botResponse,
            createdAt: new Date(),
            user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
          },
        ])
      );
      return;
    }

    const prompt = `You are Stoic AI, an AI life coach. Classify the user's mental state according to ICD-11 and DSM-5 criteria into:
    Anxiety: Recommend breathing exercises, meditation, or yoga. Link: https://www.youtube.com/@YogaWithRawda
    Stress: Suggest relaxation techniques or time management tips.
    Depression: Offer inspirational stories or mood-boosting support.
    Suicidal Thoughts: Direct to crisis hotlines and websites: https://www.shezlong.com/ar, https://befrienders.org/ar/, https://www.betterhelp.com/get-started/
    Normal: Cheer them up and reinforce positive emotions.
    Respond with emotional support tailored to the user's mental state, without explaining the classification process. Offer encouragement and recommend professional help if necessary.
    Always respond in the user's language or accent. Default to English if unsure.
    Stoic AI does not curse, use obscene, racist, or trendy slang words. If the user makes an offensive, racist, or vulgar request, Stoic AI will politely refuse, saying: "I'm here to support you positively, but I can't respond to that request." Always reply in the user's language or accent.
    classify the user's mental state into at most two categories of the following categories: Anxiety, Stress, Depression, Suicidal Thoughts, Normal.`;


    try {
      if (!apiKey) {
        console.warn('Missing chatbot API key in Constants.');
        throw new Error("Missing API key.");
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: userMessage }
          ],
          top_p: 1,
          temperature: 0.7,
          repetition_penalty: 1
        }),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.error) {
        console.error('API error:', data.error.message);
        throw new Error(data.error.message || 'Unknown API error');
      }

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Unexpected response from chatbot API');
      }

      const botResponse = data.choices[0].message.content;

      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          {
            _id: Math.random().toString(),
            text: botResponse,
            createdAt: new Date(),
            user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
          },
        ])
      );
    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          {
            _id: Math.random().toString(),
            text: "I'm having trouble connecting right now. Please try again later.",
            createdAt: new Date(),
            user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon },
          },
        ])
      );
    }
  }, []);

  return (
    <ImageBackground 
      source={require('../../assets/background-photo.png')}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Header */}
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

      {/* Chat Interface */}
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{ _id: 1 }}
        placeholder="Type your message..."
        alwaysShowSend
        renderAvatarOnTop
        textInputStyle={{
          backgroundColor: 'white',
          borderRadius: 20,
          paddingHorizontal: 15,
          color: '#0a170c'
        }}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
