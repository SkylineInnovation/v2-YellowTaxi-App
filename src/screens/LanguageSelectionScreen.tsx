import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Logo } from '../components/ui';
import { colors, textStyles, spacing } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isRTL: false,
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    isRTL: true,
  },
];

interface LanguageSelectionScreenProps {
  navigation: any;
}

export const LanguageSelectionScreen: React.FC<LanguageSelectionScreenProps> = ({
  navigation,
}) => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = React.useState<string>(
    currentLanguage || 'en'
  );

  const handleLanguageSelect = async (languageCode: string) => {
    setSelectedLanguage(languageCode);
    await changeLanguage(languageCode);
  };

  const handleContinue = () => {
    // Navigate to the phone login screen
    navigation.navigate('PhoneLogin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary[500]} />
      <Screen safeArea={false} backgroundColor={colors.primary[500]}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Logo size={80} color={colors.white} />
            <Text style={styles.appTitle}>YellowTaxi</Text>
            <Text style={styles.title}>{t('languageSelection.title')}</Text>
            <Text style={styles.subtitle}>{t('languageSelection.subtitle')}</Text>
          </View>

          {/* Language Options */}
          <View style={styles.languageContainer}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  selectedLanguage === language.code && styles.selectedLanguageOption,
                ]}
                onPress={() => handleLanguageSelect(language.code)}
                activeOpacity={0.7}
              >
                <View style={styles.languageContent}>
                  <Text
                    style={[
                      styles.languageName,
                      selectedLanguage === language.code && styles.selectedLanguageName,
                      language.code === 'ar' && styles.arabicText,
                    ]}
                  >
                    {language.nativeName}
                  </Text>
                  <Text
                    style={[
                      styles.languageSubtext,
                      selectedLanguage === language.code && styles.selectedLanguageSubtext,
                    ]}
                  >
                    {language.name}
                  </Text>
                </View>
                
                {/* Selection Indicator */}
                <View
                  style={[
                    styles.selectionIndicator,
                    selectedLanguage === language.code && styles.selectedIndicator,
                  ]}
                >
                  {selectedLanguage === language.code && (
                    <View style={styles.selectedDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>
                {t('languageSelection.continue')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
  
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing['2xl'],
  },
  
  header: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  
  appTitle: {
    ...textStyles.h2,
    color: colors.white,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  
  title: {
    ...textStyles.h3,
    color: colors.white,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...textStyles.body1,
    color: colors.primary[100],
    textAlign: 'center',
    opacity: 0.9,
  },
  
  languageContainer: {
    flex: 1,
    gap: spacing.lg,
  },
  
  languageOption: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  selectedLanguageOption: {
    backgroundColor: colors.white,
    borderColor: colors.primary[300],
  },
  
  languageContent: {
    flex: 1,
  },
  
  languageName: {
    ...textStyles.h4,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  selectedLanguageName: {
    color: colors.primary[600],
  },
  
  arabicText: {
    fontFamily: 'ElMessiri-SemiBold', // Will be added later
  },
  
  languageSubtext: {
    ...textStyles.body2,
    color: colors.primary[100],
    opacity: 0.8,
  },
  
  selectedLanguageSubtext: {
    color: colors.primary[400],
  },
  
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  selectedIndicator: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[500],
  },
  
  selectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
  },
  
  footer: {
    paddingTop: spacing.xl,
  },
  
  continueButton: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  continueButtonText: {
    ...textStyles.button,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
