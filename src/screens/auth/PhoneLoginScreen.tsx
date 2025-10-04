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
import { useTranslation } from 'react-i18next';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';

import { Screen, Button, PhoneInput, Logo } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendOTP, clearError } from '../../store/slices/authSlice';
import { phoneAuthService } from '../../services/auth';
import { colors, textStyles, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTextStyle } from '../../utils/fonts';
import { firebaseApp } from '../../config/firebase';

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
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);

  const handleCountryChange = (country: any) => {
    setCountryCode(country.dialCode);
  };
  
  const dispatch = useAppDispatch();
  const { phoneVerification } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear any previous errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert(t('common.error'), t('auth.phoneLogin.invalidPhone'));
      return;
    }

    // Validate phone number
    if (!phoneAuthService.validatePhoneNumber(phoneNumber, countryCode)) {
      Alert.alert(t('common.error'), t('auth.phoneLogin.invalidPhone'));
      return;
    }

    try {
      const result = await dispatch(sendOTP({
        phoneNumber,
        countryCode,
        recaptchaVerifier: recaptchaVerifier.current,
      })).unwrap();

      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phoneNumber: result.phoneNumber,
        confirmationResult: result.confirmationResult,
      });
    } catch (error) {
      Alert.alert(
        t('common.error'),
        typeof error === 'string' ? error : t('auth.phoneLogin.error')
      );
    }
  };

  const isValidPhone = phoneNumber.trim().length > 0 &&
    phoneAuthService.validatePhoneNumber(phoneNumber, countryCode);

  return (
    <Screen scrollable safeArea>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseApp.options}
        attemptInvisibleVerification={true}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Logo size={100} />
          <Text style={createTextStyle(currentLanguage, styles.title, 'bold')}>
            {t('auth.phoneLogin.title')}
          </Text>
          <Text style={createTextStyle(currentLanguage, styles.subtitle)}>
            {t('auth.phoneLogin.subtitle')}
          </Text>
        </View>

        <View style={styles.form}>
          <PhoneInput
            label={t('auth.phoneLogin.phoneNumber')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onChangeCountry={handleCountryChange}
            placeholder={t('auth.phoneLogin.phoneNumberPlaceholder')}
            defaultCountry="JO"
            autoFocus
            error={phoneVerification.error || undefined}
          />

          <Text style={createTextStyle(currentLanguage, styles.disclaimer)}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
            We'll send you a verification code via SMS.
          </Text>

          <Button
            title={t('auth.phoneLogin.continue')}
            onPress={handleSendOTP}
            loading={phoneVerification.loading}
            disabled={!isValidPhone}
            fullWidth
            testID="send-otp-button"
          />
        </View>

        <View style={styles.footer}>
          <Text style={createTextStyle(currentLanguage, styles.footerText)}>
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
