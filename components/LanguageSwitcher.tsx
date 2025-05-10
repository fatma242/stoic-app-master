import React, { useState } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import i18n from '../constants/i18n';

const LanguageSwitcher = () => {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);

  const toggleLanguage = () => {
    const newLocale = currentLocale.startsWith('ar') ? 'en' : 'ar';
    i18n.locale = newLocale;
    setCurrentLocale(newLocale);
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={{
        backgroundColor: '#E0FFE0',
        borderRadius: 50,
        paddingHorizontal: 14,
        paddingVertical: 6,
        position: 'absolute',
        top: 10,
        right: 10
      }}
    >
      <Text>{currentLocale.startsWith('ar') ? 'EN' : 'AR'}</Text>
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;