import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { Location, LocationSearchResult, LocationSearchSuggestion } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';

interface LocationInputProps {
  placeholder: string;
  value: Location | null;
  onChange: (location: Location | null) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  placeholder,
  value,
  onChange,
  disabled = false,
  icon,
}) => {
  const [inputText, setInputText] = useState(value?.address || '');
  const [suggestions, setSuggestions] = useState<LocationSearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Update input text when value changes externally
  useEffect(() => {
    setInputText(value?.address || '');
  }, [value]);

  // Mock location search function
  const searchLocations = async (query: string): Promise<LocationSearchSuggestion[]> => {
    // In a real app, this would integrate with Google Places API or similar
    // For now, return mock suggestions based on common Amman locations
    const mockSuggestions: LocationSearchSuggestion[] = [
      {
        id: '1',
        title: 'Abdali Mall',
        subtitle: 'King Hussein Business Park, Amman',
        location: {
          address: 'Abdali Mall, King Hussein Business Park, Amman',
          coordinates: { lat: 31.9754, lng: 35.9284 },
          placeId: 'abdali_mall',
        },
        type: 'search',
      },
      {
        id: '2',
        title: 'City Mall',
        subtitle: 'Tlaa Al Ali, Amman',
        location: {
          address: 'City Mall, Tlaa Al Ali, Amman',
          coordinates: { lat: 31.9973, lng: 35.8729 },
          placeId: 'city_mall',
        },
        type: 'search',
      },
      {
        id: '3',
        title: 'Queen Alia International Airport',
        subtitle: 'Airport Road, Amman',
        location: {
          address: 'Queen Alia International Airport, Airport Road, Amman',
          coordinates: { lat: 31.7226, lng: 35.9932 },
          placeId: 'qaia',
        },
        type: 'search',
      },
      {
        id: '4',
        title: 'Downtown Amman',
        subtitle: 'Al-Balad, Amman',
        location: {
          address: 'Downtown Amman, Al-Balad, Amman',
          coordinates: { lat: 31.9539, lng: 35.9106 },
          placeId: 'downtown_amman',
        },
        type: 'search',
      },
      {
        id: '5',
        title: 'University of Jordan',
        subtitle: 'Jubeiha, Amman',
        location: {
          address: 'University of Jordan, Jubeiha, Amman',
          coordinates: { lat: 32.0105, lng: 35.8719 },
          placeId: 'university_jordan',
        },
        type: 'search',
      },
    ];

    // Filter suggestions based on query
    return mockSuggestions.filter(
      (suggestion) =>
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.subtitle.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handleInputChange = async (text: string) => {
    setInputText(text);

    if (text.length > 2) {
      setIsLoading(true);
      try {
        const results = await searchLocations(text);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error searching locations:', error);
        Alert.alert('Error', 'Failed to search locations');
      } finally {
        setIsLoading(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: LocationSearchSuggestion) => {
    setInputText(suggestion.location.address);
    onChange(suggestion.location);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setInputText('');
    onChange(null);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const renderSuggestion = ({ item }: { item: LocationSearchSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <Text style={styles.suggestionSubtitle}>{item.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon ? styles.inputWithIcon : null]}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[400]}
          editable={!disabled}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {inputText.length > 0 && !disabled && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.gray[900],
    paddingVertical: spacing.xs,
  },
  inputWithIcon: {
    marginLeft: 0,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  clearButtonText: {
    fontSize: 20,
    color: colors.gray[400],
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: spacing.xs,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  suggestionSubtitle: {
    ...textStyles.caption,
    color: colors.gray[600],
  },
  loadingContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
  },
});
