import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen, Logo } from '../components/ui';
import { colors, textStyles, spacing } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';
import { createTextStyle } from '../utils/fonts';

export const SplashScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  return (
    <Screen safeArea={false} backgroundColor={colors.primary[500]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Logo size={120} color={colors.white} />
          <Text style={createTextStyle(currentLanguage, styles.title, 'bold')}>
            {t('splash.title')}
          </Text>
          <Text style={createTextStyle(currentLanguage, styles.subtitle)}>
            {t('splash.subtitle')}
          </Text>
        </View>
        
        <View style={styles.footer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={createTextStyle(currentLanguage, styles.loadingText)}>
            {t('splash.loading')}
          </Text>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  logo: {
    marginBottom: spacing.lg,
  },
  
  title: {
    ...textStyles.h1,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...textStyles.h5,
    color: colors.primary[100],
  },
  
  footer: {
    alignItems: 'center',
    gap: spacing.md,
  },
  
  loadingText: {
    ...textStyles.body1,
    color: colors.white,
  },
});
