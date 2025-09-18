import React, { useState, forwardRef } from 'react';
import {
  TextInput as RNTextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps as RNTextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, textStyles, spacing, borderRadius } from '../../theme';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  required?: boolean;
}

export const TextInput = forwardRef<RNTextInput, TextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerStyle,
      inputStyle,
      labelStyle,
      variant = 'outlined',
      size = 'md',
      required = false,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;
    const hasValue = !!props.value || !!props.defaultValue;

    const containerStyles = [
      styles.container,
      containerStyle,
    ];

    const inputContainerStyles = [
      styles.inputContainer,
      styles[variant],
      styles[size],
      isFocused && styles.focused,
      hasError && styles.error,
      props.editable === false && styles.disabled,
    ];

    const textInputStyles = [
      styles.input,
      styles[`${size}Input`],
      leftIcon && styles.inputWithLeftIcon,
      rightIcon && styles.inputWithRightIcon,
      inputStyle,
    ];

    const labelStyles = [
      styles.label,
      styles[`${size}Label`],
      hasError && styles.errorLabel,
      labelStyle,
    ];

    return (
      <View style={containerStyles}>
        {label && (
          <Text style={labelStyles}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        
        <View style={inputContainerStyles}>
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}
          
          <RNTextInput
            ref={ref}
            style={textInputStyles}
            placeholderTextColor={colors.gray[400]}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          
          {rightIcon && (
            <View style={styles.rightIconContainer}>
              {rightIcon}
            </View>
          )}
        </View>
        
        {(error || helperText) && (
          <Text style={[styles.helperText, hasError && styles.errorText]}>
            {error || helperText}
          </Text>
        )}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  
  label: {
    ...textStyles.label,
    color: colors.gray[700],
    marginBottom: spacing.xs,
  },
  
  required: {
    color: colors.error[500],
  },
  
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  
  input: {
    flex: 1,
    ...textStyles.body1,
    color: colors.gray[900],
    padding: 0, // Remove default padding
  },
  
  leftIconContainer: {
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  
  rightIconContainer: {
    marginLeft: spacing.sm,
    marginRight: spacing.md,
  },
  
  helperText: {
    ...textStyles.caption,
    color: colors.gray[500],
    marginTop: spacing.xs,
  },
  
  errorText: {
    color: colors.error[500],
  },
  
  errorLabel: {
    color: colors.error[500],
  },
  
  // Variants
  default: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
  },
  
  outlined: {
    backgroundColor: colors.white,
    borderColor: colors.gray[300],
  },
  
  filled: {
    backgroundColor: colors.gray[50],
    borderColor: colors.gray[200],
  },
  
  // Sizes
  sm: {
    minHeight: 36,
  },
  
  md: {
    minHeight: 48,
  },
  
  lg: {
    minHeight: 56,
  },
  
  // Input sizes
  smInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  
  mdInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  
  lgInput: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  
  // Label sizes
  smLabel: {
    fontSize: 12,
  },
  
  mdLabel: {
    fontSize: 14,
  },
  
  lgLabel: {
    fontSize: 16,
  },
  
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  
  inputWithRightIcon: {
    paddingRight: 0,
  },
  
  // States
  focused: {
    borderColor: colors.primary[500],
    borderWidth: 2,
  },
  
  error: {
    borderColor: colors.error[500],
  },
  
  disabled: {
    backgroundColor: colors.gray[100],
    borderColor: colors.gray[200],
  },
});
