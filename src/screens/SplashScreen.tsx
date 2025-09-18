import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/ui';
import { colors, textStyles, spacing } from '../theme';

export const SplashScreen: React.FC = () => {
  return (
    <Screen safeArea={false} backgroundColor={colors.primary[500]}>
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.logo}>🚕</Text>
          <Text style={styles.title}>YellowTaxi</Text>
          <Text style={styles.subtitle}>Your ride, your way</Text>
        </View>
        
        <View style={styles.footer}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={styles.loadingText}>Loading...</Text>
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
    fontSize: 80,
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
