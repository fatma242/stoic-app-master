import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import i18n from '../constants/i18n';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { AnswerButtons } from '../components/AnswerButtons';
import { onboardingFlow, handleEmergencyCall, AnswerKey } from '../components/OnboardingFlow';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center'
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  questionText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 40,
    lineHeight: 28,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr'
  },
  resourceText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
    lineHeight: 24,
    writingDirection: i18n.locale.startsWith('ar') ? 'rtl' : 'ltr'
  },
  emergencyText: {
    color: 'red',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 15
  }
});

export default function Onboarding() {
  const router = useRouter();
  const [currentNode, setCurrentNode] = useState<AnswerKey>('initial');
  const [assessmentResults, setAssessmentResults] = useState<Record<string, string>>({});

  const handleAnswer = (answer: string) => {
    const node = onboardingFlow[currentNode];
    const nextNode = node.answers[answer];

    if (nextNode === 'RESOURCES') {
      showResources();
      return;
    }

    if (typeof nextNode === 'string') {
      setCurrentNode(nextNode);
    }

    setAssessmentResults(prev => ({
      ...prev,
      [currentNode]: answer
    }));

    if (onboardingFlow[nextNode].resourcesKey) {
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
      <>
        <Text style={styles.questionText}>
          {i18n.t(node.questionKey)}
        </Text>
        <AnswerButtons 
          onAnswer={handleAnswer}
          answers={Object.keys(node.answers)}
        />
      </>
    );
  };

   return (
    <View style={styles.container}>
      <LanguageSwitcher />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {renderQuestion()}
      </ScrollView>
    </View>
  );
}