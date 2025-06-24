import BackgroundVideo from '@/components/BackgroundVideo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AnswerButtons } from '../components/AnswerButtons';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { AnswerKey, handleEmergencyCall, onboardingFlow } from '../components/OnboardingFlow';
import i18n from '../constants/i18n';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 40,
    lineHeight: 28,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr',
  },
  resourceText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 20,
    lineHeight: 24,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr',
  },
  emergencyText: {
    color: '#FF4444',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 15,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 30,
  },
  navButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  skipButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    textDecorationLine: 'underline',
  }
});

const extraStyles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#FFFFFF',
  }
});

export default function Onboarding() {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState<AnswerKey>('initial');
  const [assessmentResults, setAssessmentResults] = useState<Record<string, string>>({});
  const [key, setKey] = useState(0);
  const [history, setHistory] = useState<AnswerKey[]>([]);

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

    // Add current node to history before moving forward
    setHistory(prev => [...prev, currentNode]);

    if (nextNode === 'RESOURCES') {
      showResources();
      return;
    }

    if (typeof nextNode === 'string') {
      setCurrentNode(nextNode as AnswerKey);
    }

    if (onboardingFlow[nextNode as AnswerKey]?.resourcesKey) {
      router.replace('/login');
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const previousNode = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1)); // Remove current node from history
      setCurrentNode(previousNode);
    }
  };

  const handleSkip = () => {
    // Skip to next question in the flow
    const node = onboardingFlow[currentNode];
    const firstAnswerKey = Object.keys(node.answers)[0];
    const nextNode = node.answers[firstAnswerKey];
    
    if (typeof nextNode === 'string') {
      setHistory(prev => [...prev, currentNode]);
      setCurrentNode(nextNode as AnswerKey);
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
      <View style={{ alignItems: 'center', width: '100%' }}>
        <Text style={styles.questionText}>
          {i18n.t(node.questionKey)}
        </Text>
        <AnswerButtons
          answers={Object.keys(node.answers)}
          onAnswer={handleAnswer}
          translationPrefix={currentNode === 'initial' ? 'onboarding.moodOptions' : 'onboarding.answers'}
        />
        
        <View style={styles.navigationContainer}>
          {/* Show Back button only if not on initial screen and has history */}
          {(currentNode !== 'initial' && history.length > 0) ? (
            <TouchableOpacity 
              style={styles.navButton}
              onPress={handleBack}
            >
              <Text style={styles.navButtonText}>
                {i18n.t('onboarding.back')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.navButton} /> // Empty spacer to maintain layout
          )}
          
          {/* Skip button - shows different text on initial screen */}
          <TouchableOpacity 
            style={[styles.navButton, styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={[styles.navButtonText, styles.skipButtonText]}>
              {currentNode === 'initial' ? i18n.t('onboarding.skip') : i18n.t('onboarding.continue')}
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