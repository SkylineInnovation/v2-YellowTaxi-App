import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors, textStyles, spacing } from '../../theme';

export interface ServiceIconProps {
  icon: string;
  title: string;
  description?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const ServiceIcon: React.FC<ServiceIconProps> = ({
  icon,
  title,
  description,
  onPress,
  disabled = false,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },

  disabled: {
    opacity: 0.6,
    backgroundColor: colors.gray[50],
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary[100],
  },

  iconText: {
    fontSize: 28,
    lineHeight: 32,
  },

  title: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },

  description: {
    ...textStyles.caption,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 16,
  },
});
