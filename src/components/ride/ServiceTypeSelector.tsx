import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ServiceType, ServiceTypeConfig } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';

interface ServiceTypeSelectorProps {
  selectedType: ServiceType;
  onSelect: (type: ServiceType) => void;
  disabled?: boolean;
  estimatedPrice?: number;
}

const serviceTypeConfigs: ServiceTypeConfig[] = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday trips',
    icon: '🚗',
    baseFare: 1.5,
    pricePerKm: 0.5,
    pricePerMinute: 0.1,
    features: ['Budget-friendly', 'Standard vehicles'],
    estimatedWaitTime: 5,
  },
  {
    id: 'standard',
    name: 'Standard',
    description: 'Comfortable rides with reliable service',
    icon: '🚕',
    baseFare: 2.0,
    pricePerKm: 0.7,
    pricePerMinute: 0.15,
    features: ['Comfortable', 'Professional drivers', 'Air conditioning'],
    estimatedWaitTime: 3,
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury vehicles for special occasions',
    icon: '🚙',
    baseFare: 3.0,
    pricePerKm: 1.0,
    pricePerMinute: 0.2,
    features: ['Luxury vehicles', 'Premium service', 'Complimentary water'],
    estimatedWaitTime: 7,
  },
];

export const ServiceTypeSelector: React.FC<ServiceTypeSelectorProps> = ({
  selectedType,
  onSelect,
  disabled = false,
  estimatedPrice,
}) => {
  const renderServiceType = (config: ServiceTypeConfig) => {
    const isSelected = selectedType === config.id;
    
    return (
      <TouchableOpacity
        key={config.id}
        style={[
          styles.serviceTypeCard,
          isSelected && styles.selectedCard,
          disabled && styles.disabledCard,
        ]}
        onPress={() => !disabled && onSelect(config.id)}
        disabled={disabled}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          <View style={styles.serviceInfo}>
            <Text style={[styles.serviceName, isSelected && styles.selectedText]}>
              {config.name}
            </Text>
            <Text style={[styles.serviceDescription, isSelected && styles.selectedSubtext]}>
              {config.description}
            </Text>
          </View>
          <View style={styles.priceContainer}>
            {estimatedPrice ? (
              <Text style={[styles.price, isSelected && styles.selectedText]}>
                {estimatedPrice.toFixed(2)} JOD
              </Text>
            ) : (
              <Text style={[styles.waitTime, isSelected && styles.selectedSubtext]}>
                ~{config.estimatedWaitTime} min
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.featuresContainer}>
          {config.features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={[styles.featureText, isSelected && styles.selectedSubtext]}>
                • {feature}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choose Service Type</Text>
      <View style={styles.serviceTypesContainer}>
        {serviceTypeConfigs.map(renderServiceType)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    ...textStyles.h3,
    color: colors.gray[900],
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  serviceTypesContainer: {
    paddingHorizontal: spacing.md,
  },
  serviceTypeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
    shadowColor: colors.primary[500],
    shadowOpacity: 0.2,
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  serviceDescription: {
    ...textStyles.caption,
    color: colors.gray[600],
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: 'bold',
  },
  waitTime: {
    ...textStyles.caption,
    color: colors.gray[600],
  },
  selectedText: {
    color: colors.primary[700],
  },
  selectedSubtext: {
    color: colors.primary[600],
  },
  featuresContainer: {
    marginTop: spacing.xs,
  },
  featureItem: {
    marginBottom: spacing.xs,
  },
  featureText: {
    ...textStyles.caption,
    color: colors.gray[600],
    fontSize: 12,
  },
});
