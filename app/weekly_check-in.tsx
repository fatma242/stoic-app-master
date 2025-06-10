import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { weeklyCheckInFlow, WeeklyFlowKey } from '../components/weeklyCheckInFlow';
import i18n from '../constants/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';

const WeeklyCheckInScreen = () => {
  const [currentNode, setCurrentNode] = useState<WeeklyFlowKey>('initial');
  const [history, setHistory] = useState<WeeklyFlowKey[]>([]);
  const [refresh, setRefresh] = useState(0);

  const router = useRouter();
  const locale = i18n.locale;

  global.reloadApp = () => {
    setRefresh(prev => prev + 1);
  };

  const handleAnswer = (answer: string) => {
    const node = weeklyCheckInFlow[currentNode];
    const nextKey = node.answers[answer];

    setHistory(prev => [...prev, currentNode]);

    if (
      typeof nextKey === 'string' &&
      nextKey in weeklyCheckInFlow &&
      weeklyCheckInFlow[nextKey as WeeklyFlowKey]?.resourcesKey
    ) {
      router.push('/progress');
    } else if (typeof nextKey === 'string' && nextKey in weeklyCheckInFlow) {
      setCurrentNode(nextKey as WeeklyFlowKey);
    }
  };

  const handleBack = () => {
    const prevHistory = [...history];
    const prev = prevHistory.pop();
    if (prev) {
      setCurrentNode(prev);
      setHistory(prevHistory);
    }
  };

  const handleSkip = () => {
    const node = weeklyCheckInFlow[currentNode];
    const firstAnswer = Object.keys(node.answers)[0];
    handleAnswer(firstAnswer);
  };

  const renderQuestion = () => {
    const node = weeklyCheckInFlow[currentNode];

    if (node.resourcesKey) {
      return <Text style={styles.resourceText}>{i18n.t(node.resourcesKey)}</Text>;
    }

    return <Text style={styles.questionText}>{i18n.t(node.questionKey)}</Text>;
  };

  const renderAnswers = () => {
    const node = weeklyCheckInFlow[currentNode];
    if (node.resourcesKey) return null;

    return (
      <View style={styles.answersContainer}>
        {Object.entries(node.answers).map(([key]) => (
          <TouchableOpacity
            key={key}
            style={styles.answerButton}
            onPress={() => handleAnswer(key)}
          >
            <Text style={styles.answerText}>
              {i18n.t(`weeklyCheckIn.answers.${key}`, { defaultValue: key })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Video
        source={require('../assets/background.mp4')}
        style={styles.backgroundVideo}
        isMuted
        shouldPlay
        isLooping
        resizeMode={ResizeMode.COVER}
      />
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.contentContainer}>
            <LanguageSwitcher />
            <Text style={styles.welcomeText}>
              {locale === 'ar' ? 'مرحبًا بك في التقييم الأسبوعي' : 'Welcome to your Weekly Check-In'}
            </Text>

            {renderQuestion()}
            {renderAnswers()}

            <View style={styles.navigationContainer}>
              {history.length > 0 ? (
                <TouchableOpacity style={styles.navButton} onPress={handleBack}>
                  <Text style={styles.navButtonText}>{i18n.t('onboarding.back')}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.navButton} />
              )}

              <TouchableOpacity style={[styles.navButton, styles.skipButton]} onPress={handleSkip}>
                <Text style={[styles.navButtonText, styles.skipButtonText]}>
                  {i18n.t('onboarding.continue')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default WeeklyCheckInScreen;

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%', height: '100%',
    zIndex: -1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    width: '90%',
    backgroundColor: 'rgba(128, 128, 128, 0.18)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    writingDirection: i18n.locale === 'ar' ? 'rtl' : 'ltr',
    marginBottom: 20,
  },
  resourceText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 30,
  },
  answersContainer: {
    width: '100%',
    alignItems: 'center',
  },
  answerButton: {
    backgroundColor: '#289942',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 6,
    width: '90%',
  },
  answerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    width: '100%',
  },
  navButton: {
    backgroundColor: '#289942',
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  skipButton: {
    backgroundColor: '#289942',
  },
  skipButtonText: {
    color: '#fff',
  },
});
