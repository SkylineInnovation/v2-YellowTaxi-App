import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
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
          setIsRTL(savedLanguage === 'ar');
          await i18n.changeLanguage(savedLanguage);
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
      
      // Handle RTL layout
      if (newIsRTL !== I18nManager.isRTL) {
        I18nManager.allowRTL(newIsRTL);
        I18nManager.forceRTL(newIsRTL);
        // Note: App restart may be required for RTL changes to take full effect
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
