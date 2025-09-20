// Phone validation utility for React Native
// Matches the web application's phone validation logic

export interface CountryPhoneInfo {
  code: string;
  name: string;
  flag: string;
  pattern: RegExp;
  placeholder: string;
  example: string;
  dialCode: string;
}

export const COUNTRY_PHONE_VALIDATION: CountryPhoneInfo[] = [
  {
    code: 'JO',
    name: 'Jordan',
    flag: '🇯🇴',
    pattern: /^7[0-9]{8}$/,
    placeholder: '7X XXX XXXX',
    example: '799123456',
    dialCode: '+962'
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    pattern: /^[2-9][0-9]{9}$/,
    placeholder: '(XXX) XXX-XXXX',
    example: '5551234567',
    dialCode: '+1'
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    pattern: /^[2-9][0-9]{9}$/,
    placeholder: '(XXX) XXX-XXXX',
    example: '5551234567',
    dialCode: '+1'
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    pattern: /^[1-9][0-9]{9,10}$/,
    placeholder: '7XXX XXX XXX',
    example: '7911123456',
    dialCode: '+44'
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    flag: '🇸🇦',
    pattern: /^5[0-9]{8}$/,
    placeholder: '5X XXX XXXX',
    example: '501234567',
    dialCode: '+966'
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    pattern: /^5[0-9]{8}$/,
    placeholder: '5X XXX XXXX',
    example: '501234567',
    dialCode: '+971'
  },
  {
    code: 'EG',
    name: 'Egypt',
    flag: '🇪🇬',
    pattern: /^1[0-9]{9}$/,
    placeholder: '1XX XXX XXXX',
    example: '1012345678',
    dialCode: '+20'
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    pattern: /^[1-9][0-9]{10,11}$/,
    placeholder: '1XX XXX XXXX',
    example: '15123456789',
    dialCode: '+49'
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    pattern: /^[1-9][0-9]{8}$/,
    placeholder: '1 XX XX XX XX',
    example: '123456789',
    dialCode: '+33'
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    pattern: /^[2-9][0-9]{8}$/,
    placeholder: '2XXX XXX XXX',
    example: '212345678',
    dialCode: '+61'
  }
];

/**
 * Validates phone number for a specific country
 * @param phone - Phone number to validate (without country code)
 * @param dialCode - Dial code (e.g., '+962', '+1')
 * @returns true if valid, false otherwise
 */
export function isValidPhoneForCountry(phone: string, dialCode: string): boolean {
  const country = COUNTRY_PHONE_VALIDATION.find(c => c.dialCode === dialCode);
  if (!country) {
    // Fallback validation for unsupported countries
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 7 && cleaned.length <= 15;
  }
  
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  return country.pattern.test(cleanPhone);
}

/**
 * Validates a complete phone number (with or without country code)
 * @param phoneNumber - Complete phone number
 * @param selectedDialCode - Currently selected dial code (optional)
 * @returns true if valid, false otherwise
 */
export function validatePhoneNumber(phoneNumber: string, selectedDialCode?: string): boolean {
  // Remove all non-digit characters and plus sign
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it starts with +, it's in international format
  if (cleaned.startsWith('+')) {
    // Check if it matches E.164 format
    const e164Pattern = /^\+[1-9]\d{1,14}$/;
    if (!e164Pattern.test(cleaned)) {
      return false;
    }
    
    // Extract country code and local number
    for (const country of COUNTRY_PHONE_VALIDATION) {
      const dialCode = country.dialCode.replace('+', '');
      if (cleaned.startsWith(`+${dialCode}`)) {
        const localNumber = cleaned.substring(dialCode.length + 1);
        return country.pattern.test(localNumber);
      }
    }
    
    // Fallback for unsupported countries
    const withoutPlus = cleaned.substring(1);
    return withoutPlus.length >= 7 && withoutPlus.length <= 15;
  }
  
  // If no country code, use the selected dial code
  if (selectedDialCode) {
    return isValidPhoneForCountry(cleaned, selectedDialCode);
  }
  
  // Default validation (basic length check)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

/**
 * Formats phone number to international E.164 format
 * @param phone - Phone number to format (without country code)
 * @param dialCode - Dial code (e.g., '+962', '+1')
 * @returns Formatted phone number in E.164 format
 */
export function formatPhoneNumber(phone: string, dialCode: string): string {
  // Remove any non-digit characters
  const cleanPhone = phone.replace(/\D/g, '');
  
  // If it's already in international format, return as is
  if (phone.startsWith('+')) {
    return phone;
  }
  
  // Add dial code
  return `${dialCode}${cleanPhone}`;
}

/**
 * Formats phone number for display purposes
 * @param phone - Phone number to format
 * @param dialCode - Dial code (e.g., '+962', '+1')
 * @returns Formatted phone number for display
 */
export function formatDisplayPhoneNumber(phone: string, dialCode: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on country
  switch (dialCode) {
    case '+962': // Jordan
      if (cleaned.length === 9) {
        return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
      }
      break;
    case '+1': // US/Canada
      if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      }
      break;
    case '+44': // UK
      if (cleaned.length === 11) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
      }
      break;
  }
  
  return phone;
}

/**
 * Gets country info by dial code
 * @param dialCode - Dial code (e.g., '+962', '+1')
 * @returns Country info or undefined if not found
 */
export function getCountryByDialCode(dialCode: string): CountryPhoneInfo | undefined {
  return COUNTRY_PHONE_VALIDATION.find(c => c.dialCode === dialCode);
}

/**
 * Extracts dial code from a complete phone number
 * @param phoneNumber - Complete phone number with country code
 * @returns Dial code or null if not found
 */
export function extractDialCode(phoneNumber: string): string | null {
  const cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  if (!cleaned.startsWith('+')) {
    return null;
  }
  
  // Check against known dial codes
  for (const country of COUNTRY_PHONE_VALIDATION) {
    if (cleaned.startsWith(country.dialCode)) {
      return country.dialCode;
    }
  }
  
  return null;
}
