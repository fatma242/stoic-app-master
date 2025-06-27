import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import BackgroundVideo from '@/components/BackgroundVideo';

export default function TermsOfService() {
  return (
    <View style={styles.container}>
      <BackgroundVideo />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Our Commitment to You</Text>

        <Text style={styles.paragraph}>
          Stoic is your supportive AI companion, here to help with your mental well-being and personal growth journey. Please remember I'm designed as a guide - not a replacement for professional therapists or healthcare providers.
        </Text>

        <Text style={styles.paragraph}>
          Your privacy is deeply respected. We only use information you choose to share with us, and any data that helps improve your experience is carefully anonymized to protect your identity.
        </Text>

        <Text style={styles.paragraph}>
          If you ever face significant emotional challenges or a mental health crisis, we encourage you to connect with licensed professionals or local support services. Your safety and well-being come first.
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