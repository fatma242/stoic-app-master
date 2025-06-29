import React, { useEffect, useState } from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import BackgroundVideo from '@/components/BackgroundVideo';
import i18n from "../constants/i18n";
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function TermsOfService() {
  const isRTL = i18n.locale === 'ar';
  const textAlign = isRTL ? 'right' : 'left';
  const titleStyle = isRTL ? styles.rtlTitle : styles.title;
  const [key, setKey] = useState(0);

  useEffect(() => {
    global.reloadApp = () => setKey(prev => prev + 1);
    return () => {
      global.reloadApp = undefined;
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={{ marginTop: 30 , marginRight: 10, alignSelf: "flex-end" }}>
        <LanguageSwitcher />
      </View>
      <BackgroundVideo />
      <View style={styles.overlay} />
      
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[titleStyle, { color: '#05a843' }]}>
          {i18n.t('termsOfService.title')}
        </Text>

        {Array.isArray(i18n.t('termsOfService.paragraphs', { returnObjects: true }))
          ? (i18n.t('termsOfService.paragraphs', { returnObjects: true }) as string[]).map((paragraph: string, index: number) => (
              <Text 
                key={index} 
                style={[styles.paragraph, { textAlign }]}
              >
                {paragraph}
              </Text>
            ))
          : (
              <Text style={[styles.paragraph, { textAlign }]}>
                {i18n.t('termsOfService.paragraphs')}
              </Text>
            )
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    zIndex: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  rtlTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    fontFamily: 'Cairo-Bold', 
  },
  paragraph: {
    fontSize: 17,
    color: '#fff',
    marginBottom: 22,
    lineHeight: 26,
    textAlign: 'justify',
  },
});