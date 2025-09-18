import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Screen, Button, PhoneInput } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendOTP, clearError } from '../../store/slices/authSlice';
import { phoneAuthService } from '../../services/auth';
import { colors, textStyles, spacing } from '../../theme';

type PhoneLoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'PhoneLogin'
>;

type PhoneLoginScreenRouteProp = RouteProp<AuthStackParamList, 'PhoneLogin'>;

interface Props {
  navigation: PhoneLoginScreenNavigationProp;
  route: PhoneLoginScreenRouteProp;
}

export const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+962');
  
  const dispatch = useAppDispatch();
  const { phoneVerification } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    // Validate phone number
    if (!phoneAuthService.validatePhoneNumber(phoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      const result = await dispatch(sendOTP({
        phoneNumber,
        countryCode,
      })).unwrap();

      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: result.phoneNumber,
        confirmationResult: result.confirmationResult,
      });
    } catch (error) {
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'Failed to send OTP. Please try again.'
      );
    }
  };

  const isValidPhone = phoneNumber.trim().length > 0 && 
    phoneAuthService.validatePhoneNumber(phoneNumber);

  return (
    <Screen scrollable safeArea>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🚕</Text>
          <Text style={styles.title}>Welcome to YellowTaxi</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started
          </Text>
        </View>

        <View style={styles.form}>
          <PhoneInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            defaultCountry="JO"
            autoFocus
            error={phoneVerification.error || undefined}
          />

          <Text style={styles.disclaimer}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            We'll send you a verification code via SMS.
          </Text>

          <Button
            title="Send Verification Code"
            onPress={handleSendOTP}
            loading={phoneVerification.loading}
            disabled={!isValidPhone}
            fullWidth
            testID="send-otp-button"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Need help? Contact our support team
          </Text>
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.xl,
  },
  
  logo: {
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
  
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  
  disclaimer: {
    ...textStyles.caption,
    color: colors.gray[500],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 16,
  },
  
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
  
  footerText: {
    ...textStyles.caption,
    color: colors.gray[500],
    textAlign: 'center',
  },
});
