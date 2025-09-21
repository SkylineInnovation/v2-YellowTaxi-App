import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { PaymentMethod, PaymentMethodConfig } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelect: (method: PaymentMethod) => void;
  disabled?: boolean;
}

const paymentMethodConfigs: PaymentMethodConfig[] = [
  {
    id: 'cash',
    name: 'Cash',
    description: 'Pay with cash at the end of your ride',
    icon: '💵',
    enabled: true,
    requiresSetup: false,
  },
  {
    id: 'card',
    name: 'Credit/Debit Card',
    description: 'Pay securely with your card',
    icon: '💳',
    enabled: true,
    requiresSetup: true,
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    description: 'Pay from your YellowTaxi wallet balance',
    icon: '📱',
    enabled: false, // Disabled for now
    requiresSetup: true,
  },
];

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelect,
  disabled = false,
}) => {
  const renderPaymentMethod = (config: PaymentMethodConfig) => {
    const isSelected = selectedMethod === config.id;
    const isDisabled = disabled || !config.enabled;
    
    return (
      <TouchableOpacity
        key={config.id}
        style={[
          styles.paymentMethodCard,
          isSelected && styles.selectedCard,
          isDisabled && styles.disabledCard,
        ]}
        onPress={() => !isDisabled && onSelect(config.id)}
        disabled={isDisabled}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{config.icon}</Text>
          </View>
          
          <View style={styles.methodInfo}>
            <View style={styles.methodHeader}>
              <Text style={[styles.methodName, isSelected && styles.selectedText]}>
                {config.name}
              </Text>
              {config.requiresSetup && (
                <Text style={[styles.setupBadge, isSelected && styles.selectedBadge]}>
                  Setup Required
                </Text>
              )}
            </View>
            <Text style={[styles.methodDescription, isSelected && styles.selectedSubtext]}>
              {config.description}
            </Text>
          </View>
          
          <View style={styles.selectionIndicator}>
            <View style={[
              styles.radioButton,
              isSelected && styles.selectedRadio,
            ]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
          </View>
        </View>
        
        {!config.enabled && (
          <View style={styles.comingSoonBanner}>
            <Text style={styles.comingSoonText}>Coming Soon</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      <View style={styles.paymentMethodsContainer}>
        {paymentMethodConfigs.map(renderPaymentMethod)}
      </View>
      
      <View style={styles.noteContainer}>
        <Text style={styles.noteText}>
          💡 You can change your payment method anytime in settings
        </Text>
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
  paymentMethodsContainer: {
    paddingHorizontal: spacing.md,
  },
  paymentMethodCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.gray[200],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  selectedCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  disabledCard: {
    opacity: 0.6,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  methodInfo: {
    flex: 1,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  methodName: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
    flex: 1,
  },
  setupBadge: {
    fontSize: 10,
    color: colors.secondary[600],
    backgroundColor: colors.secondary[100],
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedBadge: {
    color: colors.primary[700],
    backgroundColor: colors.primary[200],
  },
  methodDescription: {
    ...textStyles.caption,
    color: colors.gray[600],
  },
  selectedText: {
    color: colors.primary[700],
  },
  selectedSubtext: {
    color: colors.primary[600],
  },
  selectionIndicator: {
    marginLeft: spacing.sm,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.gray[300],
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRadio: {
    borderColor: colors.primary[500],
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[500],
  },
  comingSoonBanner: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.gray[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 8,
  },
  comingSoonText: {
    ...textStyles.caption,
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  noteContainer: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
  noteText: {
    ...textStyles.caption,
    color: colors.gray[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
