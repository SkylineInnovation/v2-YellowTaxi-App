import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTextStyle, getTextAlign } from '../../utils/fonts';
import { colors, textStyles, spacing } from '../../theme';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleColor: string;
  licensePlate: string;
}

interface FormErrors {
  [key: string]: string;
}

interface DocumentUpload {
  drivingLicense: boolean;
  vehicleRegistration: boolean;
  insurance: boolean;
}

interface BecomeDriverScreenProps {
  navigation?: any;
}

export const BecomeDriverScreen: React.FC<BecomeDriverScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    licensePlate: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [documents, setDocuments] = useState<DocumentUpload>({
    drivingLicense: false,
    vehicleRegistration: false,
    insurance: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateYear = (year: string): boolean => {
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);
    return yearNum >= 1990 && yearNum <= currentYear;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Personal Information Validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = t('driver.application.validation.firstNameRequired');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('driver.application.validation.lastNameRequired');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('driver.application.validation.emailRequired');
    } else if (!validateEmail(formData.email)) {
      newErrors.email = t('driver.application.validation.emailInvalid');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('driver.application.validation.phoneRequired');
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('driver.application.validation.phoneInvalid');
    }
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = t('driver.application.validation.dateOfBirthRequired');
    }
    if (!formData.address.trim()) {
      newErrors.address = t('driver.application.validation.addressRequired');
    }

    // Vehicle Information Validation
    if (!formData.vehicleMake.trim()) {
      newErrors.vehicleMake = t('driver.application.validation.vehicleMakeRequired');
    }
    if (!formData.vehicleModel.trim()) {
      newErrors.vehicleModel = t('driver.application.validation.vehicleModelRequired');
    }
    if (!formData.vehicleYear.trim()) {
      newErrors.vehicleYear = t('driver.application.validation.vehicleYearRequired');
    } else if (!validateYear(formData.vehicleYear)) {
      newErrors.vehicleYear = t('driver.application.validation.vehicleYearInvalid');
    }
    if (!formData.vehicleColor.trim()) {
      newErrors.vehicleColor = t('driver.application.validation.vehicleColorRequired');
    }
    if (!formData.licensePlate.trim()) {
      newErrors.licensePlate = t('driver.application.validation.licensePlateRequired');
    }

    // Document Validation
    if (!documents.drivingLicense || !documents.vehicleRegistration || !documents.insurance) {
      newErrors.documents = t('driver.application.validation.documentsRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleDocumentUpload = (documentType: keyof DocumentUpload) => {
    // Simulate document upload
    Alert.alert(
      t('driver.application.uploadDocument'),
      `Upload ${documentType}`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('driver.application.uploadDocument'),
          onPress: () => {
            setDocuments(prev => ({ ...prev, [documentType]: true }));
            // Clear document error if all documents are now uploaded
            if (errors.documents) {
              const allUploaded = Object.values({ ...documents, [documentType]: true }).every(Boolean);
              if (allUploaded) {
                setErrors(prev => ({ ...prev, documents: '' }));
              }
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      Alert.alert(t('common.error'), 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation?.goBack();
  };

  const renderInput = (
    field: keyof FormData,
    label: string,
    placeholder: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' | 'numeric' = 'default',
    multiline: boolean = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={createTextStyle(currentLanguage, styles.inputLabel, 'medium')}>
        {label}
      </Text>
      <TextInput
        style={[
          createTextStyle(currentLanguage, styles.textInput),
          multiline && styles.textInputMultiline,
          errors[field] && styles.textInputError,
          { textAlign: getTextAlign(currentLanguage) }
        ]}
        value={formData[field]}
        onChangeText={(value: string) => handleInputChange(field, value)}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[400]}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
      />
      {errors[field] && (
        <Text style={createTextStyle(currentLanguage, styles.errorText)}>
          {errors[field]}
        </Text>
      )}
    </View>
  );

  const renderDocumentUpload = (
    documentType: keyof DocumentUpload,
    label: string
  ) => (
    <View style={styles.documentContainer}>
      <View style={[styles.documentInfo, isRTL && { flexDirection: 'row-reverse' }]}>
        <Text style={createTextStyle(currentLanguage, styles.documentLabel, 'medium')}>
          {label}
        </Text>
        <TouchableOpacity
          style={[
            styles.uploadButton,
            documents[documentType] && styles.uploadButtonSuccess
          ]}
          onPress={() => handleDocumentUpload(documentType)}
        >
          <Text style={[
            createTextStyle(currentLanguage, styles.uploadButtonText, 'medium'),
            documents[documentType] && styles.uploadButtonTextSuccess
          ]}>
            {documents[documentType] 
              ? t('driver.application.documentUploaded')
              : t('driver.application.uploadDocument')
            }
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={createTextStyle(currentLanguage, styles.title, 'bold')}>
            {t('driver.application.title')}
          </Text>
          <Text style={createTextStyle(currentLanguage, styles.subtitle)}>
            {t('driver.application.subtitle')}
          </Text>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={createTextStyle(currentLanguage, styles.sectionTitle, 'semiBold')}>
            {t('driver.application.personalInfo')}
          </Text>
          
          {renderInput('firstName', t('driver.application.firstName'), t('driver.application.firstNamePlaceholder'))}
          {renderInput('lastName', t('driver.application.lastName'), t('driver.application.lastNamePlaceholder'))}
          {renderInput('email', t('driver.application.email'), t('driver.application.emailPlaceholder'), 'email-address')}
          {renderInput('phone', t('driver.application.phone'), t('driver.application.phonePlaceholder'), 'phone-pad')}
          {renderInput('dateOfBirth', t('driver.application.dateOfBirth'), t('driver.application.dateOfBirthPlaceholder'))}
          {renderInput('address', t('driver.application.address'), t('driver.application.addressPlaceholder'), 'default', true)}
        </View>

        {/* Vehicle Information Section */}
        <View style={styles.section}>
          <Text style={createTextStyle(currentLanguage, styles.sectionTitle, 'semiBold')}>
            {t('driver.application.vehicleInfo')}
          </Text>
          
          {renderInput('vehicleMake', t('driver.application.vehicleMake'), t('driver.application.vehicleMakePlaceholder'))}
          {renderInput('vehicleModel', t('driver.application.vehicleModel'), t('driver.application.vehicleModelPlaceholder'))}
          {renderInput('vehicleYear', t('driver.application.vehicleYear'), t('driver.application.vehicleYearPlaceholder'), 'numeric')}
          {renderInput('vehicleColor', t('driver.application.vehicleColor'), t('driver.application.vehicleColorPlaceholder'))}
          {renderInput('licensePlate', t('driver.application.licensePlate'), t('driver.application.licensePlatePlaceholder'))}
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={createTextStyle(currentLanguage, styles.sectionTitle, 'semiBold')}>
            {t('driver.application.documents')}
          </Text>
          
          {renderDocumentUpload('drivingLicense', t('driver.application.drivingLicense'))}
          {renderDocumentUpload('vehicleRegistration', t('driver.application.vehicleRegistration'))}
          {renderDocumentUpload('insurance', t('driver.application.insurance'))}
          
          {errors.documents && (
            <Text style={createTextStyle(currentLanguage, styles.errorText)}>
              {errors.documents}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <View style={[styles.submitButtonContent, isRTL && { flexDirection: 'row-reverse' }]}>
              <ActivityIndicator size="small" color={colors.white} />
              <Text style={createTextStyle(currentLanguage, styles.submitButtonText, 'semiBold')}>
                {t('driver.application.submitting')}
              </Text>
            </View>
          ) : (
            <Text style={createTextStyle(currentLanguage, styles.submitButtonText, 'semiBold')}>
              {t('driver.application.submit')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessModalClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={createTextStyle(currentLanguage, styles.modalTitle, 'bold')}>
              {t('driver.application.success.title')}
            </Text>
            <Text style={createTextStyle(currentLanguage, styles.modalMessage)}>
              {t('driver.application.success.message')}
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSuccessModalClose}
            >
              <Text style={createTextStyle(currentLanguage, styles.modalButtonText, 'semiBold')}>
                {t('driver.application.success.backToHome')}
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
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    ...textStyles.h2,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
  },
  section: {
    backgroundColor: colors.white,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary[500],
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    ...textStyles.body2,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  textInput: {
    ...textStyles.body1,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    color: colors.gray[900],
    minHeight: 48,
  },
  textInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  textInputError: {
    borderColor: colors.error[500],
    borderWidth: 2,
  },
  errorText: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing.xs,
  },
  documentContainer: {
    marginBottom: spacing.md,
  },
  documentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  documentLabel: {
    ...textStyles.body2,
    color: colors.gray[700],
    flex: 1,
  },
  uploadButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 120,
  },
  uploadButtonSuccess: {
    backgroundColor: colors.success[500],
  },
  uploadButtonText: {
    ...textStyles.caption,
    color: colors.white,
    textAlign: 'center',
  },
  uploadButtonTextSuccess: {
    color: colors.white,
  },
  submitButton: {
    backgroundColor: colors.primary[500],
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.gray[400],
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  submitButtonText: {
    ...textStyles.body1,
    color: colors.white,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    ...textStyles.h3,
    color: colors.success[600],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  modalMessage: {
    ...textStyles.body2,
    color: colors.gray[700],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  modalButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    minWidth: 150,
  },
  modalButtonText: {
    ...textStyles.body1,
    color: colors.white,
    textAlign: 'center',
  },
});

export default BecomeDriverScreen;
