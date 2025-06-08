import React, { useState, useCallback } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import i18n from '../constants/i18n';

// Add a type declaration for global.reloadApp
declare global {
  // eslint-disable-next-line no-var
  var reloadApp: (() => void) | undefined;
}

const LanguageSwitcher = () => {
  const [currentLocale, setCurrentLocale] = useState(i18n.locale);

  const toggleLanguage = useCallback(() => {
    const newLocale = currentLocale === 'ar' ? 'en' : 'ar';
    i18n.locale = newLocale;
    setCurrentLocale(newLocale);
    // Force re-render of the parent component
    if (global.reloadApp) {
      global.reloadApp();
    }
  }, [currentLocale]);

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
        right: 10,
        zIndex: 1000
      }}
    >
      <Text>{currentLocale === 'ar' ? 'EN' : 'AR'}</Text>
    </TouchableOpacity>
  );
};

export default LanguageSwitcher;