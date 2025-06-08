import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useRouter } from 'expo-router';
import i18n from '../constants/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { AnswerButtons } from '../components/AnswerButtons';
import { onboardingFlow, handleEmergencyCall, AnswerKey } from '../components/OnboardingFlow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent', // Changed from white to transparent
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Dark overlay for better text readability
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF', // Changed to white for better contrast
    marginBottom: 40,
    lineHeight: 28,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr',
  },
  resourceText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF', // Changed to white for better contrast
    marginBottom: 20,
    lineHeight: 24,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr',
  },
  emergencyText: {
    color: '#FF4444', // Brighter red for better visibility
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 15,
  }
});

// Update extraStyles
const extraStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Added transparent background
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#FFFFFF', // Changed to white for better contrast
  }
});

export default function Onboarding() {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState<AnswerKey>('initial');
  const [assessmentResults, setAssessmentResults] = useState<Record<string, string>>({});
  const [key, setKey] = useState(0);

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

  const handleAnswer = (answer: string) => {
    const node = onboardingFlow[currentNode];
    const nextNode = node.answers[answer];

    setAssessmentResults(prev => ({
      ...prev,
      [currentNode]: answer
    }));

    if (nextNode === 'RESOURCES') {
      showResources();
      return;
    }

    if (typeof nextNode === 'string') {
      setCurrentNode(nextNode);
    }

    if (onboardingFlow[nextNode as AnswerKey]?.resourcesKey) {
      router.push('/home');
    }
  };

  const showResources = () => {
    const mainConditionEntry = Object.entries(assessmentResults)
      .find(([key, value]) => value === 'yes' && key === 'initial');
    
    const mainCondition = mainConditionEntry?.[1] as keyof typeof onboardingFlow | undefined;

    if (mainCondition === 'hopeless_q5') {
      setCurrentNode('crisis_resources');
    } else if (mainCondition) {
      const resourceNode = `${mainCondition}_resources` as AnswerKey;
      setCurrentNode(resourceNode);
    }
  };

  const renderQuestion = () => {
    const node = onboardingFlow[currentNode];
    
    if (node.resourcesKey) {
      return (
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.resourceText}>
            {i18n.t(node.resourcesKey)}
          </Text>
          {currentNode === 'crisis_resources' && (
            <TouchableOpacity onPress={handleEmergencyCall}>
              <Text style={styles.emergencyText}>
                {i18n.t('onboarding.resources.suicidal')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.questionText}>
          {i18n.t(node.questionKey)}
        </Text>
        <AnswerButtons
          answers={Object.keys(node.answers)}
          onAnswer={handleAnswer}
          translationPrefix={currentNode === 'initial' ? 'onboarding.moodOptions' : 'onboarding.answers'}
        />

      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Video
        source={require("../assets/background.mp4")}
        style={styles.backgroundVideo}
        rate={1.0}
        volume={1.0}
        isMuted={true}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
      />
      <View style={styles.overlay}>
        <View style={styles.container} key={key}>
          <View style={{ marginTop: 20 }}>
            <LanguageSwitcher />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={extraStyles.contentContainer}>
              <Text style={extraStyles.welcomeText}>
                {i18n.t('onboarding.welcome')}
              </Text>
              {renderQuestion()}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
