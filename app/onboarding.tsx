import BackgroundVideo from '@/components/BackgroundVideo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnswerButtons } from '../components/AnswerButtons';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { AnswerKey, handleEmergencyCall, onboardingFlow } from '../components/OnboardingFlow';
import i18n from '../constants/i18n';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: 'transparent' },
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.3)' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  questionText: { fontSize: 20, textAlign: 'center', color: '#FFFFFF', marginBottom: 40, lineHeight: 28, writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr' },
  resourceText: { fontSize: 18, textAlign: 'center', color: '#FFFFFF', marginBottom: 20, lineHeight: 24, writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr' },
  emergencyText: { color: '#FF4444', fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 16, marginTop: 15 },
  navigationContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 30 },
  navButton: { paddingVertical: 12, paddingHorizontal: 25, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.5)' },
  navButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '500' },
  skipButton: { backgroundColor: 'transparent', borderWidth: 0 },
  skipButtonText: { color: 'rgba(255, 255, 255, 0.7)', textDecorationLine: 'underline' }
});

const extraStyles = StyleSheet.create({
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20, backgroundColor: 'transparent' },
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center', color: '#FFFFFF' }
});

export default function Onboarding() {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState<AnswerKey>('initial');
  const [assessmentResults, setAssessmentResults] = useState<Record<string, string>>({});
  const [key, setKey] = useState(0);
  const [history, setHistory] = useState<AnswerKey[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => { global.reloadApp = undefined; };
  }, []);

  const submitStatus = async (status: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('User ID not found');

      const res = await axios.post(
        `${API_BASE_URL}/api/users/submit-status`,
        {
          userId: parseInt(userId, 10),
          status: status.toUpperCase()
        },
        { withCredentials: true }
      );
      console.log('✅ Status submitted:', res.data);
    } catch (error) {
      console.error('❌ Error submitting status:', error);
    }
  };

  const showResources = async (results: Record<string, string>, finalNode: AnswerKey) => {
    if (hasSubmitted) return;

    let status: string = 'NORMAL';

    const yesAnswers = Object.entries(results)
      .filter(([_, value]) => value === 'yes')
      .map(([key]) => key);

    const noAnswers = Object.entries(results)
      .filter(([_, value]) => value === 'no')
      .map(([key]) => key);

    if (yesAnswers.includes('hopeless_q5') || noAnswers.includes('hopeless_q5')) status = 'SUICIDAL';
    else if (yesAnswers.includes('disconnected_q5') || noAnswers.includes('disconnected_q5')) status = 'ANXIETY';
    else if (yesAnswers.includes('low_energy_q5') || noAnswers.includes('low_energy_q5')) status = 'DEPRESSION';
    else if (yesAnswers.includes('overwhelmed_q5') || noAnswers.includes('overwhelmed_q5')) status = 'STRESS';

    setCurrentNode(finalNode);

    console.log('📤 Submitting user status:', status);
    await submitStatus(status);
    setHasSubmitted(true);
  };

  const handleAnswer = (answer: string) => {
    const node = onboardingFlow[currentNode];
    const nextNode = node.answers[answer];

    console.log('➡️ Moving to node:', nextNode);

    if (
      typeof nextNode === 'string' &&
      nextNode in onboardingFlow &&
      onboardingFlow[nextNode as AnswerKey]?.resourcesKey
    ) {
      setAssessmentResults(prev => {
        const updated = { ...prev, [currentNode]: answer };
        setTimeout(() => showResources(updated, nextNode as AnswerKey), 0);
        return updated;
      });
      return;
    }


    setAssessmentResults(prev => ({ ...prev, [currentNode]: answer }));
    setHistory(prev => [...prev, currentNode]);
    setCurrentNode(nextNode as AnswerKey);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    const previousNode = history[history.length - 1];
    setCurrentNode(previousNode);
    setHistory(prev => prev.slice(0, -1));
  };

  const handleSkip = async () => {
    if (hasSubmitted) return;
    const status = 'NORMAL';
    setCurrentNode('normal_resources');
    await submitStatus(status);
    setHasSubmitted(true);
    setTimeout(() => router.replace('/login'), 3000);
  };

  const renderQuestion = () => {
    const node = onboardingFlow[currentNode];

    if (node.resourcesKey) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.resourceText}>{i18n.t(node.resourcesKey)}</Text>

          {currentNode === 'crisis_resources' && (
            <TouchableOpacity onPress={handleEmergencyCall}>
              <Text style={styles.emergencyText}>{i18n.t('onboarding.resources.hopeless')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navButton, { marginTop: 30, paddingHorizontal: 32 }]}
            onPress={() => router.replace('/home')}
          >
            <Text style={styles.navButtonText}>
              {i18n.locale.startsWith('ar') ? 'استمرار' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }


    return (
      <View style={{ alignItems: 'center', width: '100%' }}>
        <Text style={styles.questionText}>{i18n.t(node.questionKey)}</Text>
        <AnswerButtons
          answers={Object.keys(node.answers)}
          onAnswer={handleAnswer}
          translationPrefix={currentNode === 'initial' ? 'onboarding.moodOptions' : 'onboarding.answers'}
        />
        <View style={styles.navigationContainer}>
          {(currentNode !== 'initial' && history.length > 0) ? (
            <TouchableOpacity style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navButtonText}>{i18n.t('onboarding.back')}</Text>
            </TouchableOpacity>
          ) : (<View style={styles.navButton} />)}

          <TouchableOpacity style={[styles.navButton, styles.skipButton]} onPress={handleSkip}>
            <Text style={[styles.navButtonText, styles.skipButtonText]}>
              {currentNode === 'initial' ? i18n.t('onboarding.skip') : i18n.t('onboarding.skip')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <BackgroundVideo />
      <View style={styles.overlay}>
        <View style={styles.container} key={key}>
          <View style={{ marginTop: 20 }}>
            <LanguageSwitcher />
          </View>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={extraStyles.contentContainer}>
              <Text style={extraStyles.welcomeText}>{i18n.t('onboarding.welcome')}</Text>
              {renderQuestion()}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
