import React, { useState, useEffect, useRef } from 'react';
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

import { Screen, Button, OTPInput } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { verifyOTP, sendOTP, clearError } from '../../store/slices/authSlice';
import { colors, textStyles, spacing } from '../../theme';

type OTPVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'OTPVerification'
>;

type OTPVerificationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'OTPVerification'
>;

interface Props {
  navigation: OTPVerificationScreenNavigationProp;
  route: OTPVerificationScreenRouteProp;
}

export const OTPVerificationScreen: React.FC<Props> = ({ navigation, route }) => {
  const [otp, setOTP] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  
  const { phoneNumber, confirmationResult } = route.params;

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
    
    // Start resend timer
    startResendTimer();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [dispatch]);

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(60);
    
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit verification code');
      return;
    }

    try {
      const user = await dispatch(verifyOTP({
        otp,
        confirmationResult,
      })).unwrap();

      // Check if user needs to complete profile setup
      // For now, navigate to role selection for new users
      navigation.navigate('RoleSelection', { user });
    } catch (error) {
      Alert.alert(
        'Verification Failed',
        typeof error === 'string' ? error : 'Invalid verification code. Please try again.'
      );
      setOTP(''); // Clear OTP input on error
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      const result = await dispatch(sendOTP({
        phoneNumber,
        countryCode: '+962', // Default to Jordan
      })).unwrap();

      // Update route params with new confirmation result
      navigation.setParams({
        confirmationResult: result.confirmationResult,
      });

      Alert.alert('Success', 'Verification code sent successfully');
      startResendTimer();
    } catch (error) {
      Alert.alert(
        'Error',
        typeof error === 'string' ? error : 'Failed to resend verification code'
      );
    }
  };

  const handleOTPComplete = (completedOTP: string) => {
    setOTP(completedOTP);
    // Auto-verify when OTP is complete
    if (completedOTP.length === 6) {
      setTimeout(() => {
        handleVerifyOTP();
      }, 100);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for display
    return phone.replace(/(\+\d{3})(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
  };

  return (
    <Screen scrollable safeArea>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>📱</Text>
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit verification code sent to
          </Text>
          <Text style={styles.phoneNumber}>
            {formatPhoneNumber(phoneNumber)}
          </Text>
        </View>

        <View style={styles.form}>
          <OTPInput
            length={6}
            value={otp}
            onChangeText={setOTP}
            onComplete={handleOTPComplete}
            autoFocus
            error={error || undefined}
          />

          <View style={styles.resendContainer}>
            {canResend ? (
              <Button
                title="Resend Code"
                variant="ghost"
                onPress={handleResendOTP}
                testID="resend-otp-button"
              />
            ) : (
              <Text style={styles.resendTimer}>
                Resend code in {resendTimer}s
              </Text>
            )}
          </View>

          <Button
            title="Verify Code"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={otp.length !== 6}
            fullWidth
            testID="verify-otp-button"
          />
        </View>

        <View style={styles.footer}>
          <Button
            title="Change Phone Number"
            variant="ghost"
            onPress={() => navigation.goBack()}
            testID="change-phone-button"
          />
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
  
  icon: {
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
    marginBottom: spacing.xs,
  },
  
  phoneNumber: {
    ...textStyles.h5,
    color: colors.primary[600],
    textAlign: 'center',
  },
  
  form: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  
  resendContainer: {
    alignItems: 'center',
    marginVertical: spacing.lg,
    minHeight: 48,
    justifyContent: 'center',
  },
  
  resendTimer: {
    ...textStyles.body2,
    color: colors.gray[500],
  },
  
  footer: {
    alignItems: 'center',
    paddingBottom: spacing.lg,
  },
});
