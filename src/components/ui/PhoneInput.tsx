import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  TextInput as RNTextInput,
} from 'react-native';
import { TextInput } from './TextInput';
import { colors, textStyles, spacing, borderRadius } from '../../theme';
import { CountryCode } from '../../types/auth';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeCountry?: (country: CountryCode) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  defaultCountry?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

// Common country codes - focusing on Middle East and international
const COUNTRY_CODES: CountryCode[] = [
  { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
  { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
  { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
  { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾' },
  { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onChangeCountry,
  placeholder = 'Phone number',
  error,
  label,
  defaultCountry = 'JO',
  disabled = false,
  autoFocus = false,
}) => {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    COUNTRY_CODES.find(country => country.code === defaultCountry) || COUNTRY_CODES[0]
  );
  const [modalVisible, setModalVisible] = useState(false);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setModalVisible(false);
    onChangeCountry?.(country);
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Format based on country (basic formatting for Jordan)
    if (selectedCountry.code === 'JO') {
      if (cleaned.length <= 3) return cleaned;
      if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
    
    // Default formatting for other countries
    return cleaned;
  };

  const handleTextChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    onChangeText(formatted);
  };

  const getFullPhoneNumber = () => {
    const cleaned = value.replace(/\D/g, '');
    return `${selectedCountry.dialCode}${cleaned}`;
  };

  const CountrySelector = () => (
    <TouchableOpacity
      style={styles.countrySelector}
      onPress={() => setModalVisible(true)}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`Selected country: ${selectedCountry.name}`}
    >
      <Text style={styles.flag}>{selectedCountry.flag}</Text>
      <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
      <Text style={styles.chevron}>▼</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TextInput
        label={label}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        error={error}
        keyboardType="phone-pad"
        autoFocus={autoFocus}
        editable={!disabled}
        leftIcon={<CountrySelector />}
        maxLength={15}
        accessibilityLabel={`Phone number input. Full number: ${getFullPhoneNumber()}`}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close country selector"
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={COUNTRY_CODES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  selectedCountry.code === item.code && styles.selectedCountryItem
                ]}
                onPress={() => handleCountrySelect(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.dialCode}`}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dialCode}</Text>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.gray[300],
    marginRight: spacing.sm,
  },
  
  flag: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  
  dialCode: {
    ...textStyles.body1,
    color: colors.gray[700],
    marginRight: spacing.xs,
  },
  
  chevron: {
    fontSize: 10,
    color: colors.gray[400],
  },
  
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  
  modalTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
  },
  
  closeButton: {
    padding: spacing.sm,
  },
  
  closeButtonText: {
    fontSize: 18,
    color: colors.gray[600],
  },
  
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  
  selectedCountryItem: {
    backgroundColor: colors.primary[50],
  },
  
  countryFlag: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  
  countryName: {
    flex: 1,
    ...textStyles.body1,
    color: colors.gray[900],
  },
  
  countryDialCode: {
    ...textStyles.body1,
    color: colors.gray[600],
  },
});
