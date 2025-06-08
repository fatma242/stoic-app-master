import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import i18n from '../constants/i18n';

type Props = {
  onAnswer: (answer: string) => void;
  answers: string[];
  translationPrefix?: string;
};

export const AnswerButtons = ({ onAnswer, answers, translationPrefix = 'onboarding.answers' }: Props) => {
  return (
    <View style={{ gap: 12 }}>
      {answers.map((answer) => (
        <TouchableOpacity
          key={answer}
          onPress={() => onAnswer(answer)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#558528', '#1a7a2e']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{i18n.t(`${translationPrefix}.${answer}`)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 29,
    borderRadius: 15, // More elliptical shape (higher value = more rounded)
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3, // Adds shadow on Android
    shadowColor: '#000', // Adds shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});