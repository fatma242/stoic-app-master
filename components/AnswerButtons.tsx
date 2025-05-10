import React from 'react';
import { View, Button } from 'react-native';
import i18n from '../constants/i18n';

type Props = {
  onAnswer: (answer: string) => void;
  answers: string[];
};

export const AnswerButtons = ({ onAnswer, answers }: Props) => {
  return (
    <View style={{ gap: 12 }}>
      {answers.map((answer) => (
        <Button
          key={answer}
          title={i18n.t(`onboarding.answers.${answer}`)}
          onPress={() => onAnswer(answer)}
        />
      ))}
    </View>
  );
};