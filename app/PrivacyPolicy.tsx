import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import BackgroundVideo from '@/components/BackgroundVideo';

export default function PrivacyPolicy() {
  return (
    <View style={styles.container}>
      <BackgroundVideo />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Your Privacy Matters</Text>

        <Text style={styles.paragraph}>
          Stoic is your friendly AI companion, here to support your mental well-being and personal growth journey. Think of me as a supportive guide - not a replacement for professional therapists or healthcare providers.
        </Text>

        <Text style={styles.paragraph}>
          Your privacy is sacred to us. We never access sensitive personal information without your clear permission, and any data we use to improve your experience is completely anonymous.
        </Text>

        <Text style={styles.paragraph}>
          If you're ever experiencing significant emotional distress or a mental health crisis, please reach out to a licensed professional or local support services. Your well-being is our highest priority.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#05a843',
    marginBottom: 24,
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 17,
    color: '#fff',
    marginBottom: 22,
    lineHeight: 26,
    textAlign: 'justify',
  },
});