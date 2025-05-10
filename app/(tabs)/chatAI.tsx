import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages => GiftedChat.append(previousMessages, newMessages));
    const userMessage = newMessages[0]?.text.toLowerCase();

    // Handle therapy-related terms
    if (therapyKeywords.some(keyword => userMessage.includes(keyword))) {
      const botResponse = "I'm here as an AI life coach, not a substitute for professional psychological support. I recommend reaching out to a mental health professional or using resources like Shezlong (https://www.shezlong.com/ar) or Befrienders (https://befrienders.org/ar/). 🌼";
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          { _id: Math.random().toString(), text: botResponse, createdAt: new Date(), user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon } },
        ])
      );
      return;
    }

    // Enhanced prompt for better classification and language detection
    const prompt = `You are Stoic AI, an AI life coach. Classify the user's mental state according to ICD-11 and DSM-5 criteria into:
    Anxiety: Recommend breathing exercises, meditation, or yoga. Link: https://www.youtube.com/@YogaWithRawda
    Stress: Suggest relaxation techniques or time management tips.
    Depression: Offer inspirational stories or mood-boosting support.
    Suicidal Thoughts: Direct to crisis hotlines and websites: https://www.shezlong.com/ar, https://befrienders.org/ar/, https://www.betterhelp.com/get-started/
    Normal: Cheer them up and reinforce positive emotions.
    Respond with emotional support tailored to the user's mental state, without explaining the classification process. Offer encouragement and recommend professional help if necessary. Always respond in the user's language or accent. Default to English if unsure.`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
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
        })
      });

      const data = await response.json();
      let botResponse = data.choices[0].message.content;

      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          { _id: Math.random().toString(), text: botResponse, createdAt: new Date(), user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon } },
        ])
      );
    } catch (error) {
      console.error('Chatbot API error:', error);
      setMessages(prevMessages =>
        GiftedChat.append(prevMessages, [
          { _id: Math.random().toString(), text: "I'm having trouble connecting right now.", createdAt: new Date(), user: { _id: 2, name: 'Stoic AI', avatar: chatbotIcon } },
        ])
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Image source={chatbotIcon} style={styles.avatar} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Stoic AI</Text>
          <Text style={styles.headerStatus}>Active now</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Entypo name="dots-three-vertical" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Chat */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  backButton: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerStatus: { fontSize: 14, color: 'green' },
  menuButton: { padding: 5 },
});

