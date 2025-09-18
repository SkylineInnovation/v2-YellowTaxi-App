import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Pressable,
} from 'react-native';
import { colors, textStyles, spacing, borderRadius } from '../../theme';

interface OTPInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (otp: string) => void;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
  secureTextEntry?: boolean;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChangeText,
  onComplete,
  autoFocus = false,
  error,
  disabled = false,
  secureTextEntry = false,
}) => {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Split the value into individual digits
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  useEffect(() => {
    if (value.length === length && onComplete) {
      onComplete(value);
    }
  }, [value, length, onComplete]);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // Handle paste operation
      const pastedDigits = digit.slice(0, length);
      onChangeText(pastedDigits);
      
      // Focus the last filled input or the next empty one
      const nextIndex = Math.min(pastedDigits.length, length - 1);
      setTimeout(() => {
        inputRefs.current[nextIndex]?.focus();
        setFocusedIndex(nextIndex);
      }, 0);
      return;
    }

    // Update the value
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join('');
    onChangeText(newValue);

    // Move to next input if digit was entered
    if (digit && index < length - 1) {
      setTimeout(() => {
        inputRefs.current[index + 1]?.focus();
        setFocusedIndex(index + 1);
      }, 0);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (!digits[index] && index > 0) {
        // Move to previous input if current is empty
        setTimeout(() => {
          inputRefs.current[index - 1]?.focus();
          setFocusedIndex(index - 1);
        }, 0);
      } else {
        // Clear current input
        const newDigits = [...digits];
        newDigits[index] = '';
        onChangeText(newDigits.join(''));
      }
    }
  };

  const handleFocus = (index: number) => {
    setFocusedIndex(index);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
  };

  const handlePress = (index: number) => {
    if (!disabled) {
      inputRefs.current[index]?.focus();
      setFocusedIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {digits.map((digit, index) => (
          <Pressable
            key={index}
            onPress={() => handlePress(index)}
            style={[
              styles.inputWrapper,
              focusedIndex === index && styles.focused,
              error && styles.error,
              disabled && styles.disabled,
            ]}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.input,
                focusedIndex === index && styles.inputFocused,
                error && styles.inputError,
                disabled && styles.inputDisabled,
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              onFocus={() => handleFocus(index)}
              onBlur={handleBlur}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              secureTextEntry={secureTextEntry}
              editable={!disabled}
              autoFocus={autoFocus && index === 0}
              accessibilityLabel={`OTP digit ${index + 1} of ${length}`}
              accessibilityRole="none"
              textContentType="oneTimeCode"
            />
          </Pressable>
        ))}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  
  inputWrapper: {
    width: 48,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  input: {
    ...textStyles.h3,
    color: colors.gray[900],
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  
  focused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  
  inputFocused: {
    color: colors.primary[600],
  },
  
  error: {
    borderColor: colors.error[500],
  },
  
  inputError: {
    color: colors.error[600],
  },
  
  disabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
  
  inputDisabled: {
    color: colors.gray[400],
  },
  
  errorText: {
    ...textStyles.caption,
    color: colors.error[500],
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
