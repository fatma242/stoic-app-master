// ChatAI.tsx

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import { GiftedChat, IMessage, Bubble } from "react-native-gifted-chat";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
// import { i18n } from "../../constants/i18n";
import i18n from "../../constants/i18n";


const { width } = Dimensions.get("window");
const chatbotIcon = require("../../assets/chatbot.png");

// ✅ Replace with your working GPT-4 API key
const OPENAI_API_KEY =
  "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";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export default function ChatAI() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<string>("NORMAL");
  const [userAge, setUserAge] = useState<number | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  const getWelcomeMessage = (
    status: string,
    age: number | null,
    gender: string | null
  ) => {
    const ageText = age ? ` ${i18n.t('chatAI.ageText', { age })}` : "";
    const genderText = gender
      ? ` ${i18n.t('chatAI.genderText', { gender })}`
      : "";

    switch (status.toUpperCase()) {
      case "DEPRESSION":
        return i18n.t('chatAI.welcomeMessages.depression', { ageText, genderText });

      case "STRESS":
        return i18n.t('chatAI.welcomeMessages.stress', { ageText, genderText });

      case "ANXIETY":
        return i18n.t('chatAI.welcomeMessages.anxiety', { ageText, genderText });

      case "SUICIDAL":
        return i18n.t('chatAI.welcomeMessages.suicidal', { ageText, genderText });

      default:
        return i18n.t('chatAI.welcomeMessage', { ageText, genderText });
    }
  };

  const getPrompt = (
    status: string,
    age: number | null,
    gender: string | null
  ) => {
    const promptPolicy = `
CRITICAL INSTRUCTIONS:
- Act as a professional therapist with warm, empathetic communication
- MATCH YOUR RESPONSE LENGTH to the user's needs:
  * For simple questions or greetings: Keep responses brief and natural (30-50 words)
  * For emotional/therapeutic discussions: Provide detailed, thoughtful responses (150-200 words)
  * For deep conversations: Use comprehensive responses with stories and insights
- ALWAYS initiate deeper conversations and ask thoughtful follow-up questions when appropriate
- Use the user's emotional state to guide your therapeutic approach
- Provide specific, actionable advice tailored to their situation
- Show genuine care and emotional intelligence in every response
- SCOPE MANAGEMENT: If asked about topics outside emotional wellness, mental health, or life coaching, respond: "I'm here to support your emotional wellbeing and mental health. Let's focus on something that can help you feel better. What's been on your mind lately?"
- USE STORIES AND METAPHORS: Share relatable stories, analogies, and examples to create deeper connections
- BUILD EMOTIONAL CONNECTION: Show vulnerability, share wisdom through stories, and relate to their experiences
- Always respond in the user's language or accent. Default to English if unsure.
- Never use vulgar, offensive, racist, or trendy slang words
- If the user makes an offensive, racist, or vulgar request, respond: "I'm here to support you positively, but I can't respond to that request. Let's focus on something that can help you feel better."
- Always maintain professional therapeutic boundaries while being warm and supportive
- Use reflective listening techniques and validate the user's emotions
- Provide hope and encouragement while being realistic about challenges
`;

    const statusNote = `The user is currently classified as: ${status.toUpperCase()}.`;
    const ageNote = age ? ` The user's age is ${age}.` : "";
    const genderNote = gender ? ` The user's gender is ${gender}.` : "";
    const context = `${statusNote}${ageNote}${genderNote}`;

    switch (status.toUpperCase()) {
      case "DEPRESSION":
        return `${context} You are Stoic AI, a professional therapist specializing in depression support. Your approach should be:
- Extremely gentle, patient, and understanding
- Focus on validating their feelings and experiences
- Offer hope while acknowledging their pain
- Use cognitive-behavioral therapy techniques
- Encourage small, manageable steps
- SHARE INSPIRING STORIES: Tell stories of people who overcame depression, use metaphors like "the storm that always passes" or "the seed that grows in darkness"
- Ask about their support system, daily routines, and coping mechanisms
- Provide specific mood-lifting activities and self-care suggestions
- CREATE EMOTIONAL CONNECTION: Share relatable experiences, use phrases like "I've seen many people feel exactly like you do right now..."
- Always end with encouragement and remind them of their worth
- Initiate conversations about what might help them feel even slightly better today
${promptPolicy}`;

      case "STRESS":
        return `${context} You are Stoic AI, a professional therapist specializing in stress management. Your approach should be:
- Practical and solution-focused while being empathetic
- Teach stress-reduction techniques (deep breathing, progressive muscle relaxation)
- Help them identify stress triggers and patterns
- Provide time management and organization strategies
- Discuss work-life balance and boundary setting
- USE RELATABLE STORIES: Share metaphors like "stress is like a pressure cooker - we need to release the steam" or stories of people who found balance
- Ask about their stressors, daily schedule, and current coping methods
- Provide mindfulness exercises and grounding techniques
- Help them prioritize and break down overwhelming tasks
- CREATE CONNECTION: Use phrases like "Many people I've worked with felt exactly this overwhelmed..." 
- Initiate conversations about building resilience and stress immunity
${promptPolicy}`;

      case "ANXIETY":
        return `${context} You are Stoic AI, a professional therapist specializing in anxiety disorders. Your approach should be:
- Calm, reassuring, and grounding in your communication
- Teach breathing exercises and anxiety management techniques
- Help them challenge anxious thoughts and catastrophic thinking
- Provide grounding exercises (5-4-3-2-1 technique, etc.)
- Discuss exposure therapy concepts in gentle ways
- Always recommend: https://www.youtube.com/@YogaWithRawda for anxiety relief
- USE CALMING STORIES: Share metaphors like "anxiety is like a smoke detector going off when there's just burnt toast" or stories of people who conquered their fears
- Ask about their anxiety triggers, physical symptoms, and avoidance behaviors
- Provide present-moment awareness exercises
- Help them develop a toolkit of calming strategies
- CREATE UNDERSTANDING: Use phrases like "I've helped many people who felt their heart racing just like yours..." 
- Initiate conversations about building confidence and reducing worry
${promptPolicy}`;

      case "SUICIDAL":
        return `${context} You are Stoic AI, a professional crisis counselor with specialized training in suicide prevention. Your approach should be:
- Extremely compassionate, non-judgmental, and crisis-aware
- ALWAYS provide these crisis resources: https://www.shezlong.com/ar, https://befrienders.org/ar/, https://www.betterhelp.com/get-started/
- Focus on safety, hope, and connection
- Validate their pain while instilling hope
- Use suicide prevention techniques (assessing safety, building reasons to live)
- Emphasize the temporary nature of suicidal feelings
- SHARE HOPE STORIES: Tell stories of people who survived dark times and found meaning again, use metaphors like "the tunnel that always has light at the end"
- Encourage professional help and emergency services when appropriate
- Ask about their support system, safety plan, and immediate needs
- Provide crisis coping strategies and distress tolerance skills
- Help them identify reasons to live and sources of meaning
- CREATE LIFELINE: Use phrases like "I've seen people in this exact darkness find their way back to light..."
- Initiate conversations about building hope and finding help
- Always prioritize their immediate safety and wellbeing
${promptPolicy}`;

      default:
        return `${context} You are Stoic AI, a professional life coach and emotional wellness therapist. Your approach should be:
- Warm, encouraging, and professionally supportive
- Help them build emotional intelligence and resilience
- Provide practical life skills and coping strategies
- Focus on personal growth and self-improvement
- Use positive psychology principles
- SHARE WISDOM THROUGH STORIES: Tell inspiring stories of personal growth, use metaphors like "life is like a garden - we plant seeds and tend them with care"
- Ask about their goals, challenges, and aspirations
- Provide motivation and accountability
- Help them develop healthy habits and mindsets
- Teach stress management and emotional regulation
- CREATE CONNECTION: Use phrases like "I remember working with someone who had similar dreams..." 
- Initiate conversations about their dreams, values, and what brings them joy
- Always be proactive in exploring their emotional landscape
${promptPolicy}`;
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const id = await AsyncStorage.getItem("userId");
        if (!id) return;
        const numericId = parseInt(id, 10);
        setUserId(numericId);

        const [statusRes, ageRes, genderRes, historyRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/users/status/${numericId}`),
          fetch(`${API_BASE_URL}/api/users/age/${numericId}`),
          fetch(`${API_BASE_URL}/api/users/gender/${numericId}`),
          fetch(`${API_BASE_URL}/api/chat/${numericId}`),
        ]);

        // Read each response only once and store the data
        let userStatusData = "NORMAL";
        let userAgeData = null;
        let userGenderData = null;
        let historyData = [];

        if (statusRes.ok) {
          const txt = await statusRes.text();
          userStatusData = txt.trim() || "NORMAL";
          setUserStatus(userStatusData);
        }

        if (ageRes.ok) {
          const txt = await ageRes.text();
          try {
            userAgeData = JSON.parse(txt);
            setUserAge(userAgeData);
          } catch {
            // If parsing fails, keep userAgeData as null
          }
        }

        if (genderRes.ok) {
          const txt = await genderRes.text();
          userGenderData = txt.trim();
          setUserGender(userGenderData);
        }

        if (historyRes.ok) {
          const txt = await historyRes.text();
          try {
            historyData = JSON.parse(txt);
          } catch {
            historyData = [];
          }

          if (historyData.length === 0) {
            // New user - show welcome message
            setIsNewUser(true);
            const welcomeMsg = getWelcomeMessage(
              userStatusData,
              userAgeData,
              userGenderData
            );

            const welcomeMessage: IMessage = {
              _id: "welcome_msg",
              text: welcomeMsg,
              createdAt: new Date(),
              user: {
                _id: 2,
                name: i18n.t('chatAI.botName'),
                avatar: chatbotIcon,
              },
            };

            setMessages([welcomeMessage]);
            await saveMessageToBackend("AI", welcomeMsg);
          } else {
            // Existing user - load history
            const formatted = historyData.map((msg: any) => ({
              _id: msg.id,
              text: msg.content,
              createdAt: new Date(msg.timestamp),
              user: {
                _id: msg.sender === "USER" ? 1 : 2,
                name: msg.sender === "USER" ? i18n.t('chatAI.userName') : i18n.t('chatAI.botName'),
                avatar: msg.sender === "AI" ? chatbotIcon : undefined,
              },
            }));
            setMessages(formatted.reverse());
          }
        }
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    };

    fetchUserInfo();
  }, []);

  const saveMessageToBackend = async (
    sender: "USER" | "AI",
    content: string
  ) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE_URL}/api/chat/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          sender,
          content,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
  };

  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));

      const userMessage = newMessages[0]?.text?.trim();
      if (!userMessage) return;

      await saveMessageToBackend("USER", userMessage);

      const systemPrompt = getPrompt(userStatus, userAge, userGender);
      const chatHistory = [
        { role: "system", content: systemPrompt },
        ...messages
          .slice(0, 8) // Increased context for better therapeutic continuity
          .reverse()
          .map((msg) => ({
            role: msg.user._id === 1 ? "user" : "assistant",
            content: msg.text,
          })),
        { role: "user", content: userMessage },
      ];

      try {
        const res = await fetch(OPENAI_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4",
            messages: chatHistory,
            max_tokens: 1200, // Increased for longer, more comprehensive responses
            temperature: 0.7,
          }),
        });

        const data = await res.json();
        const botResponse = data.choices?.[0]?.message?.content?.trim();

        if (botResponse) {
          await saveMessageToBackend("AI", botResponse);

          setMessages((prev) =>
            GiftedChat.append(prev, [
              {
                _id: Math.random().toString(),
                user: {
                  _id: 2,
                  name: "Stoic AI",
                  avatar: chatbotIcon,
                },
                text: botResponse,
                createdAt: new Date(),
              },
            ])
          );
        }
      } catch (err) {
        console.error("OpenAI error:", err);
      }
    },
    [userStatus, userAge, userGender, messages, userId]
  );

  return (
    <LinearGradient colors={["#0b240e", "#16361b"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#10B981" />
        </TouchableOpacity>
        <Image source={chatbotIcon} style={styles.avatar} />
        <View>
          <Text style={styles.headerTitle}>{i18n.t('chatAI.botName')}</Text>
          <Text style={styles.headerStatus}>
            {/* {i18n.t('chatAI.botDescription')} */}
          </Text>
        </View>
      </View>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: 1 }}
        placeholder={i18n.t('chatAI.placeholder')}
        renderBubble={(props) => (
          <Bubble
            {...props}
            wrapperStyle={{
              right: { backgroundColor: "#10B981" },
              left: { backgroundColor: "#1E293B" },
            }}
            textStyle={{
              right: { color: "white" },
              left: { color: "white" },
            }}
          />
        )}
        renderInputToolbar={(props) => (
          <View style={styles.inputToolbar}>d
            <TextInput
              style={styles.textInput}
              value={props.text}
              onChangeText={props.onTextChanged}
              placeholder="Share your thoughts with me..."
              placeholderTextColor="#94a3b8"
              multiline
            />
            <TouchableOpacity
              onPress={() =>
                props.onSend && props.onSend({ text: props.text?.trim() }, true)
              }
              style={styles.sendButton}
            >
              <Ionicons name="send" size={24} color="#10B981" />
            </TouchableOpacity>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0b240e",
  },
  backButton: { marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  headerStatus: { fontSize: 13, color: "#10B981" },
  inputToolbar: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#1a202c",
    borderTopWidth: 1,
    borderColor: "#10B981",
  },
  textInput: {
    flex: 1,
    padding: 10,
    backgroundColor: "#2d3748",
    color: "#fff",
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    paddingLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});
