import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Screen, Button, TextInput } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { ProfileSetupForm, VehicleInfo } from '../../types/auth';
import { colors, textStyles, spacing, borderRadius } from '../../theme';

type ProfileSetupScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ProfileSetup'
>;

type ProfileSetupScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ProfileSetup'
>;

interface Props {
  navigation: ProfileSetupScreenNavigationProp;
  route: ProfileSetupScreenRouteProp;
}

const VEHICLE_TYPES = [
  { id: 'sedan', label: 'Sedan', icon: '🚗' },
  { id: 'suv', label: 'SUV', icon: '🚙' },
  { id: 'hatchback', label: 'Hatchback', icon: '🚗' },
  { id: 'van', label: 'Van', icon: '🚐' },
] as const;

export const ProfileSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const { user, selectedRoles } = route.params;
  const isDriver = selectedRoles.includes('driver');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileSetupForm>({
    firstName: '',
    lastName: '',
    email: '',
    avatar: undefined,
    // Driver specific fields
    licenseNumber: isDriver ? '' : undefined,
    licenseExpiry: undefined,
    vehicle: isDriver ? {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plateNumber: '',
      type: 'sedan',
    } : undefined,
  });

  const updateFormData = (field: keyof ProfileSetupForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateVehicleData = (field: keyof VehicleInfo, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle: prev.vehicle ? { ...prev.vehicle, [field]: value } : undefined,
    }));
  };

  const handleImagePicker = () => {
    // Mock image picker - in real app, use react-native-image-picker
    Alert.alert(
      'Profile Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const validateForm = (): boolean => {
    if (!formData.firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return false;
    }
    
    if (!formData.lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name');
      return false;
    }

    if (formData.email && !isValidEmail(formData.email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (isDriver) {
      if (!formData.licenseNumber?.trim()) {
        Alert.alert('Error', 'Please enter your driver license number');
        return false;
      }

      if (!formData.vehicle?.make.trim()) {
        Alert.alert('Error', 'Please enter your vehicle make');
        return false;
      }

      if (!formData.vehicle?.model.trim()) {
        Alert.alert('Error', 'Please enter your vehicle model');
        return false;
      }

      if (!formData.vehicle?.plateNumber.trim()) {
        Alert.alert('Error', 'Please enter your vehicle plate number');
        return false;
      }
    }

    return true;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Mock API call to save profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Profile saved:', {
        user,
        roles: selectedRoles,
        profile: formData,
      });

      Alert.alert(
        'Success',
        'Your profile has been created successfully!',
        [
          {
            text: 'Continue',
            onPress: () => {
              // In a real app, this would navigate to the main app
              // For now, we'll just show a success message
              console.log('Navigate to main app');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const VehicleTypeSelector = () => (
    <View style={styles.vehicleTypeContainer}>
      <Text style={styles.sectionLabel}>Vehicle Type</Text>
      <View style={styles.vehicleTypeGrid}>
        {VEHICLE_TYPES.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.vehicleTypeOption,
              formData.vehicle?.type === type.id && styles.selectedVehicleType,
            ]}
            onPress={() => updateVehicleData('type', type.id)}
          >
            <Text style={styles.vehicleTypeIcon}>{type.icon}</Text>
            <Text style={[
              styles.vehicleTypeLabel,
              formData.vehicle?.type === type.id && styles.selectedVehicleTypeLabel,
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Screen scrollable safeArea>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your experience
          </Text>
        </View>

        <View style={styles.form}>
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <TouchableOpacity
              style={styles.photoContainer}
              onPress={handleImagePicker}
            >
              {formData.avatar ? (
                <Image source={{ uri: formData.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>📷</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.photoLabel}>Add Profile Photo</Text>
          </View>

          {/* Basic Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => updateFormData('firstName', text)}
              placeholder="Enter your first name"
              required
            />

            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => updateFormData('lastName', text)}
              placeholder="Enter your last name"
              required
            />

            <TextInput
              label="Email (Optional)"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              placeholder="Enter your email address"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Driver Information */}
          {isDriver && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Driver Information</Text>
              
              <TextInput
                label="Driver License Number"
                value={formData.licenseNumber}
                onChangeText={(text) => updateFormData('licenseNumber', text)}
                placeholder="Enter your license number"
                required
              />

              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              
              <VehicleTypeSelector />

              <View style={styles.row}>
                <TextInput
                  label="Make"
                  value={formData.vehicle?.make}
                  onChangeText={(text) => updateVehicleData('make', text)}
                  placeholder="Toyota"
                  containerStyle={styles.halfWidth}
                  required
                />
                <TextInput
                  label="Model"
                  value={formData.vehicle?.model}
                  onChangeText={(text) => updateVehicleData('model', text)}
                  placeholder="Camry"
                  containerStyle={styles.halfWidth}
                  required
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  label="Year"
                  value={formData.vehicle?.year.toString()}
                  onChangeText={(text) => updateVehicleData('year', parseInt(text) || new Date().getFullYear())}
                  placeholder="2023"
                  keyboardType="numeric"
                  containerStyle={styles.halfWidth}
                />
                <TextInput
                  label="Color"
                  value={formData.vehicle?.color}
                  onChangeText={(text) => updateVehicleData('color', text)}
                  placeholder="White"
                  containerStyle={styles.halfWidth}
                />
              </View>

              <TextInput
                label="Plate Number"
                value={formData.vehicle?.plateNumber}
                onChangeText={(text) => updateVehicleData('plateNumber', text)}
                placeholder="ABC 123"
                autoCapitalize="characters"
                required
              />
            </View>
          )}

          <Button
            title="Complete Setup"
            onPress={handleSaveProfile}
            loading={loading}
            fullWidth
            testID="complete-setup-button"
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    alignItems: 'center',
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  title: {
    ...textStyles.h2,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  
  subtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
  },
  
  form: {
    flex: 1,
  },
  
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  
  photoContainer: {
    marginBottom: spacing.sm,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
  },
  
  avatarPlaceholderText: {
    fontSize: 24,
  },
  
  photoLabel: {
    ...textStyles.body2,
    color: colors.primary[600],
  },
  
  section: {
    marginBottom: spacing.xl,
  },
  
  sectionTitle: {
    ...textStyles.h5,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  
  sectionLabel: {
    ...textStyles.label,
    color: colors.gray[700],
    marginBottom: spacing.sm,
  },
  
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  halfWidth: {
    flex: 1,
  },
  
  vehicleTypeContainer: {
    marginBottom: spacing.md,
  },
  
  vehicleTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  vehicleTypeOption: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
  },
  
  selectedVehicleType: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  
  vehicleTypeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  
  vehicleTypeLabel: {
    ...textStyles.body2,
    color: colors.gray[700],
  },
  
  selectedVehicleTypeLabel: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
