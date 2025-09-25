// Google Places Autocomplete component
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { colors, textStyles, spacing } from '../../theme';
import { locationService } from '../../services/locationService';

interface GooglePlacesResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface GooglePlacesAutocompleteProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onPlaceSelected: (place: GooglePlacesResult) => void;
  containerStyle?: any;
  inputStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  placeholder,
  value,
  onChangeText,
  onPlaceSelected,
  containerStyle,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
}) => {
  const [suggestions, setSuggestions] = useState<GooglePlacesResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchPlaces = async () => {
      if (value.length > 2) {
        setLoading(true);
        try {
          const places = await locationService.searchPlaces(value);
          setSuggestions(places.slice(0, 5));
          setShowSuggestions(true);
        } catch (error) {
          console.log('Error searching places:', error);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handlePlaceSelect = (place: GooglePlacesResult) => {
    onChangeText(place.description);
    onPlaceSelected(place);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleTextChange = (text: string) => {
    onChangeText(text);
    if (text.length <= 2) {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.inputContainer, inputStyle]}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          value={value}
          onChangeText={handleTextChange}
          placeholderTextColor={colors.gray[500]}
          autoCorrect={false}
          autoCapitalize="none"
        />
        
        {loading && (
          <ActivityIndicator 
            size="small" 
            color={colors.primary[500]} 
            style={styles.loadingIndicator}
          />
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            style={styles.rightIcon}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <ScrollView 
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          >
            {suggestions.map((place, index) => (
              <TouchableOpacity
                key={place.place_id || index}
                style={[
                  styles.suggestionItem,
                  index === suggestions.length - 1 && styles.lastSuggestionItem
                ]}
                onPress={() => handlePlaceSelect(place)}
              >
                <View style={styles.suggestionContent}>
                  <Text style={styles.suggestionMainText}>
                    {place.structured_formatting?.main_text || place.description}
                  </Text>
                  {place.structured_formatting?.secondary_text && (
                    <Text style={styles.suggestionSecondaryText}>
                      {place.structured_formatting.secondary_text}
                    </Text>
                  )}
                </View>
                <View style={styles.suggestionIcon}>
                  <Text style={styles.suggestionIconText}>📍</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...textStyles.body1,
    color: colors.gray[900],
    padding: 0,
    margin: 0,
  },
  loadingIndicator: {
    marginLeft: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: spacing.xs,
    maxHeight: 250,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 1001,
  },
  suggestionsList: {
    flex: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  lastSuggestionItem: {
    borderBottomWidth: 0,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionMainText: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '500',
  },
  suggestionSecondaryText: {
    ...textStyles.caption,
    color: colors.gray[600],
    marginTop: 2,
  },
  suggestionIcon: {
    marginLeft: spacing.sm,
  },
  suggestionIconText: {
    fontSize: 16,
  },
});

export default GooglePlacesAutocomplete;
