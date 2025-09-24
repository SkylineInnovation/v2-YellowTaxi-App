import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, textStyles, spacing } from '../../theme';

export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearchPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Where to?',
  value,
  onChangeText,
  onSearchPress,
  style,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onSearchPress}
      activeOpacity={0.8}
      testID={testID}
    >
      <View style={styles.searchIcon}>
        <View style={styles.iconCircle}>
          <View style={styles.iconHandle} />
        </View>
      </View>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.gray[500]}
        value={value}
        onChangeText={onChangeText}
        editable={!onSearchPress} // If onSearchPress is provided, make it non-editable (acts as button)
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 25,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.gray[100],
  },

  searchIcon: {
    marginRight: spacing.md,
  },

  iconCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[400],
    position: 'relative',
  },

  iconHandle: {
    position: 'absolute',
    width: 6,
    height: 2,
    backgroundColor: colors.gray[400],
    borderRadius: 1,
    top: 12,
    right: -2,
    transform: [{ rotate: '45deg' }],
  },

  input: {
    ...textStyles.body1,
    flex: 1,
    color: colors.gray[900],
    padding: 0, // Remove default padding
  },
});
