import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import { Screen, Button } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { UserRole } from '../../types/auth';
import { colors, textStyles, spacing, borderRadius, shadows } from '../../theme';

type RoleSelectionScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'RoleSelection'
>;

type RoleSelectionScreenRouteProp = RouteProp<
  AuthStackParamList,
  'RoleSelection'
>;

interface Props {
  navigation: RoleSelectionScreenNavigationProp;
  route: RoleSelectionScreenRouteProp;
}

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  icon: string;
  benefits: string[];
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'customer',
    title: 'I need rides',
    description: 'Book rides and travel comfortably',
    icon: '👤',
    benefits: [
      'Book rides instantly',
      'Track your driver in real-time',
      'Multiple payment options',
      'Rate and review drivers',
    ],
  },
  {
    id: 'driver',
    title: 'I want to drive',
    description: 'Earn money by providing rides',
    icon: '🚗',
    benefits: [
      'Flexible working hours',
      'Earn competitive rates',
      'Weekly payouts',
      'Driver support 24/7',
    ],
  },
];

export const RoleSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>([]);
  const { user } = route.params;

  const handleRoleToggle = (roleId: UserRole) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleContinue = () => {
    if (selectedRoles.length === 0) {
      Alert.alert('Please select a role', 'You need to select at least one role to continue');
      return;
    }

    navigation.navigate('ProfileSetup', {
      user,
      selectedRoles,
    });
  };

  const RoleCard: React.FC<{ role: RoleOption }> = ({ role }) => {
    const isSelected = selectedRoles.includes(role.id);

    return (
      <TouchableOpacity
        style={[
          styles.roleCard,
          isSelected && styles.selectedRoleCard,
        ]}
        onPress={() => handleRoleToggle(role.id)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: isSelected }}
        accessibilityLabel={`${role.title}. ${role.description}`}
      >
        <View style={styles.roleHeader}>
          <Text style={styles.roleIcon}>{role.icon}</Text>
          <View style={styles.roleInfo}>
            <Text style={[
              styles.roleTitle,
              isSelected && styles.selectedRoleTitle,
            ]}>
              {role.title}
            </Text>
            <Text style={[
              styles.roleDescription,
              isSelected && styles.selectedRoleDescription,
            ]}>
              {role.description}
            </Text>
          </View>
          <View style={[
            styles.checkbox,
            isSelected && styles.checkedCheckbox,
          ]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>

        <View style={styles.benefitsList}>
          {role.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>•</Text>
              <Text style={[
                styles.benefitText,
                isSelected && styles.selectedBenefitText,
              ]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Screen scrollable safeArea>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>How will you use YellowTaxi?</Text>
          <Text style={styles.subtitle}>
            Select one or both options. You can change this later.
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          {ROLE_OPTIONS.map((role) => (
            <RoleCard key={role.id} role={role} />
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title={`Continue${selectedRoles.length > 0 ? ` (${selectedRoles.length} selected)` : ''}`}
            onPress={handleContinue}
            disabled={selectedRoles.length === 0}
            fullWidth
            testID="continue-button"
          />
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
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
    paddingHorizontal: spacing.lg,
  },
  
  rolesContainer: {
    flex: 1,
    gap: spacing.md,
  },
  
  roleCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gray[200],
    ...shadows.sm,
  },
  
  selectedRoleCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  
  roleIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  
  roleInfo: {
    flex: 1,
  },
  
  roleTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  
  selectedRoleTitle: {
    color: colors.primary[700],
  },
  
  roleDescription: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  
  selectedRoleDescription: {
    color: colors.primary[600],
  },
  
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  
  checkedCheckbox: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  benefitsList: {
    gap: spacing.xs,
  },
  
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  
  benefitBullet: {
    ...textStyles.body2,
    color: colors.gray[400],
    marginRight: spacing.sm,
    marginTop: 2,
  },
  
  benefitText: {
    ...textStyles.body2,
    color: colors.gray[600],
    flex: 1,
  },
  
  selectedBenefitText: {
    color: colors.primary[600],
  },
  
  footer: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
});
