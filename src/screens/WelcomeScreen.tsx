import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import { Screen, Button } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { signOut } from '../store/slices/authSlice';
import { colors, textStyles, spacing } from '../theme';

export const WelcomeScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
    } catch (error) {
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'Failed to sign out'
      );
    }
  };

  const formatPhoneNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return 'Unknown';
    
    // Format phone number for display
    if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
      // US format: +1 (XXX) XXX-XXXX
      const digits = phoneNumber.slice(2);
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    
    return phoneNumber;
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Welcome to YellowTaxi!</Text>
          <Text style={styles.subtitle}>
            You have successfully authenticated with Firebase
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.userInfo}>
            <Text style={styles.sectionTitle}>Your Account</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phone Number:</Text>
              <Text style={styles.value}>
                {formatPhoneNumber(user?.phoneNumber || null)}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.valueSmall}>
                {user?.uid || 'Unknown'}
              </Text>
            </View>

            {user?.displayName && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Display Name:</Text>
                <Text style={styles.value}>{user.displayName}</Text>
              </View>
            )}
          </View>

          <View style={styles.features}>
            <Text style={styles.sectionTitle}>What's Next?</Text>
            
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚕</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Book a Ride</Text>
                <Text style={styles.featureDescription}>
                  Request a taxi and track your driver in real-time
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🚗</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Become a Driver</Text>
                <Text style={styles.featureDescription}>
                  Start earning by driving passengers around the city
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Manage Profile</Text>
                <Text style={styles.featureDescription}>
                  Update your information and preferences
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Firebase Authentication is working perfectly! 🔥
          </Text>
          
          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            fullWidth
            testID="sign-out-button"
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  header: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  
  title: {
    ...textStyles.h2,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  
  content: {
    flex: 1,
    paddingVertical: spacing.lg,
  },
  
  userInfo: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  label: {
    ...textStyles.body2,
    color: colors.gray[600],
    fontWeight: '500',
  },
  
  value: {
    ...textStyles.body2,
    color: colors.gray[900],
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  
  valueSmall: {
    ...textStyles.caption,
    color: colors.gray[700],
    fontFamily: 'monospace',
    flex: 1,
    textAlign: 'right',
  },
  
  features: {
    marginBottom: spacing.xl,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  
  featureText: {
    flex: 1,
  },
  
  featureTitle: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  
  featureDescription: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  
  footer: {
    paddingVertical: spacing.lg,
  },
  
  footerText: {
    ...textStyles.body2,
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontWeight: '500',
  },
});
