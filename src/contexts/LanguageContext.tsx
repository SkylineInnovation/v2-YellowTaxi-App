import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  currentLanguage: string;
  isRTL: boolean;
  changeLanguage: (languageCode: string) => Promise<void>;
  isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [isLanguageSelected, setIsLanguageSelected] = useState<boolean>(false);

  useEffect(() => {
    // Load saved language preference on app start
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
        const languageSelected = await AsyncStorage.getItem('languageSelected');
        
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          const isArabic = savedLanguage === 'ar';
          setIsRTL(isArabic);
          await i18n.changeLanguage(savedLanguage);
          
          // Set RTL layout on app startup if needed
          if (isArabic !== I18nManager.isRTL) {
            I18nManager.allowRTL(isArabic);
            I18nManager.forceRTL(isArabic);
          }
        }
        
        if (languageSelected === 'true') {
          setIsLanguageSelected(true);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, [i18n]);

  const changeLanguage = async (languageCode: string) => {
    try {
      // Update state
      setCurrentLanguage(languageCode);
      const newIsRTL = languageCode === 'ar';
      setIsRTL(newIsRTL);
      
      // Change i18n language
      await i18n.changeLanguage(languageCode);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem('selectedLanguage', languageCode);
      await AsyncStorage.setItem('languageSelected', 'true');
      setIsLanguageSelected(true);
      
      // Handle RTL layout changes
      if (newIsRTL !== I18nManager.isRTL) {
        I18nManager.allowRTL(newIsRTL);
        I18nManager.forceRTL(newIsRTL);
        
        // Show alert to user about app restart for full RTL support
        Alert.alert(
          languageCode === 'ar' ? 'إعادة تشغيل التطبيق' : 'App Restart Required',
          languageCode === 'ar' 
            ? 'لتطبيق التغييرات بالكامل، يرجى إعادة تشغيل التطبيق.'
            : 'To fully apply the layout changes, please restart the app.',
          [
            {
              text: languageCode === 'ar' ? 'موافق' : 'OK',
              style: 'default',
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    changeLanguage,
    isLanguageSelected,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // Provide default values during app initialization
    return {
      currentLanguage: 'en',
      isRTL: false,
      changeLanguage: async () => {},
      isLanguageSelected: false,
    };
  }
  return context;
};
