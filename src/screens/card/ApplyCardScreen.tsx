import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, textStyles, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTextStyle, getTextAlign } from '../../utils/fonts';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  monthlyIncome: string;
  employmentStatus: string;
  nationalId: string;
}

interface FormErrors {
  [key: string]: string;
}

const ApplyCardScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentLanguage, isRTL } = useLanguage();

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    monthlyIncome: '',
    employmentStatus: '',
    nationalId: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const employmentOptions = [
    { key: 'employed', label: t('card.application.employmentOptions.employed') },
    { key: 'selfEmployed', label: t('card.application.employmentOptions.selfEmployed') },
    { key: 'student', label: t('card.application.employmentOptions.student') },
    { key: 'retired', label: t('card.application.employmentOptions.retired') },
    { key: 'unemployed', label: t('card.application.employmentOptions.unemployed') },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('card.application.validation.firstNameRequired');
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('card.application.validation.lastNameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('card.application.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('card.application.validation.emailInvalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('card.application.validation.phoneRequired');
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = t('card.application.validation.phoneInvalid');
    }

    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = t('card.application.validation.dateOfBirthRequired');
    }

    if (!formData.address.trim()) {
      newErrors.address = t('card.application.validation.addressRequired');
    }

    if (!formData.monthlyIncome.trim()) {
      newErrors.monthlyIncome = t('card.application.validation.monthlyIncomeRequired');
    } else if (isNaN(Number(formData.monthlyIncome)) || Number(formData.monthlyIncome) <= 0) {
      newErrors.monthlyIncome = t('card.application.validation.monthlyIncomeInvalid');
    }

    if (!formData.employmentStatus.trim()) {
      newErrors.employmentStatus = t('card.application.validation.employmentStatusRequired');
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = t('card.application.validation.nationalIdRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(resolve, 2000));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('card.application.submitError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const renderInput = (
    field: keyof FormData,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[
        styles.inputLabel,
        createTextStyle(currentLanguage, { fontSize: 14 }, 'medium'),
        { textAlign: getTextAlign(currentLanguage) }
      ]}>
        {placeholder}
      </Text>
      <TextInput
        style={[
          styles.input,
          createTextStyle(currentLanguage, { fontSize: 16 }, 'regular'),
          { textAlign: getTextAlign(currentLanguage) },
          errors[field] && styles.inputError,
          multiline && styles.multilineInput
        ]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {errors[field] && (
        <Text style={[
          styles.errorText,
          createTextStyle(currentLanguage, { fontSize: 12 }, 'regular'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          {errors[field]}
        </Text>
      )}
    </View>
  );

  const renderEmploymentPicker = () => (
    <View style={styles.inputContainer}>
      <Text style={[
        styles.inputLabel,
        createTextStyle(currentLanguage, { fontSize: 14 }, 'medium'),
        { textAlign: getTextAlign(currentLanguage) }
      ]}>
        {t('card.application.employmentStatus')}
      </Text>
      <View style={styles.pickerContainer}>
        {employmentOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.pickerOption,
              formData.employmentStatus === option.key && styles.pickerOptionSelected
            ]}
            onPress={() => handleInputChange('employmentStatus', option.key)}
          >
            <Text style={[
              styles.pickerOptionText,
              createTextStyle(currentLanguage, { fontSize: 14 }, 'regular'),
              formData.employmentStatus === option.key && styles.pickerOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.employmentStatus && (
        <Text style={[
          styles.errorText,
          createTextStyle(currentLanguage, { fontSize: 12 }, 'regular'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          {errors.employmentStatus}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.title,
              createTextStyle(currentLanguage, { fontSize: 24 }, 'bold'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.title')}
            </Text>
            <Text style={[
              styles.subtitle,
              createTextStyle(currentLanguage, { fontSize: 16 }, 'regular'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.subtitle')}
            </Text>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              createTextStyle(currentLanguage, { fontSize: 18 }, 'semiBold'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.personalInfo')}
            </Text>

            {renderInput('firstName', t('card.application.firstName'))}
            {renderInput('lastName', t('card.application.lastName'))}
            {renderInput('email', t('card.application.email'), 'email-address')}
            {renderInput('phone', t('card.application.phone'), 'phone-pad')}
            {renderInput('dateOfBirth', t('card.application.dateOfBirth'))}
            {renderInput('nationalId', t('card.application.nationalId'))}
            {renderInput('address', t('card.application.address'), 'default', true)}
          </View>

          {/* Financial Information Section */}
          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              createTextStyle(currentLanguage, { fontSize: 18 }, 'semiBold'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.financialInfo')}
            </Text>

            {renderEmploymentPicker()}
            {renderInput('monthlyIncome', t('card.application.monthlyIncome'), 'numeric')}
          </View>

          {/* Terms and Conditions */}
          <View style={styles.termsContainer}>
            <Text style={[
              styles.termsText,
              createTextStyle(currentLanguage, { fontSize: 14 }, 'regular'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.termsText')}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={[
              styles.submitButtonText,
              createTextStyle(currentLanguage, { fontSize: 16 }, 'semiBold')
            ]}>
              {isSubmitting ? t('card.application.submitting') : t('card.application.submit')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={[
              styles.modalTitle,
              createTextStyle(currentLanguage, { fontSize: 20 }, 'bold'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.success.title')}
            </Text>
            <Text style={[
              styles.modalMessage,
              createTextStyle(currentLanguage, { fontSize: 16 }, 'regular'),
              { textAlign: getTextAlign(currentLanguage) }
            ]}>
              {t('card.application.success.message')}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={[
                styles.modalButtonText,
                createTextStyle(currentLanguage, { fontSize: 16 }, 'semiBold')
              ]}>
                {t('card.application.success.backToHome')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  title: {
    color: colors.primary[800],
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.primary[600],
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.gray[800],
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.white,
    color: colors.gray[900],
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.error[500],
  },
  errorText: {
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  pickerOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  pickerOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  pickerOptionText: {
    color: colors.gray[700],
  },
  pickerOptionTextSelected: {
    color: colors.white,
  },
  termsContainer: {
    padding: spacing.lg,
    backgroundColor: colors.gray[50],
    marginHorizontal: spacing.lg,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  termsText: {
    color: colors.gray[600],
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    color: colors.success[600],
    marginBottom: spacing.md,
  },
  modalMessage: {
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  modalButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  modalButtonText: {
    color: colors.white,
  },
});

export default ApplyCardScreen;
