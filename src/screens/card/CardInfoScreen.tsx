import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing } from '../../theme';
import { useLanguage } from '../../contexts/LanguageContext';
import { createTextStyle, getTextAlign } from '../../utils/fonts';

const { width } = Dimensions.get('window');

const CardInfoScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { currentLanguage } = useLanguage();

  // Mock user data - in real app this would come from user context/API
  const cardData = {
    balance: 1250.75,
    points: 3420,
    cardName: 'YellowTaxi Gold Card',
    cliqName: 'SHQ1983',
    cardNumber: '**** **** **** 1983',
    expiryDate: '12/27',
    isActive: true,
  };

  const handleApplyForCard = () => {
    navigation.navigate('ApplyCard' as never);
  };

  const handleTopUp = () => {
    // TODO: Implement top-up functionality
    console.log('Top up card');
  };

  const handleTransactionHistory = () => {
    // TODO: Implement transaction history
    console.log('View transaction history');
  };

  const renderCardVisual = () => (
    <View style={styles.cardContainer}>
      <View style={styles.card}>
        {/* Card Background Gradient Effect */}
        <View style={styles.cardGradient}>
          {/* YellowTaxi Logo */}
          <View style={styles.cardHeader}>
            <Text style={[
              styles.cardBrand,
              createTextStyle(currentLanguage, { fontSize: 18 }, 'bold')
            ]}>
              YellowTaxi
            </Text>
            <View style={styles.cardChip} />
          </View>

          {/* Card Number */}
          <Text style={[
            styles.cardNumber,
            createTextStyle(currentLanguage, { fontSize: 20 }, 'medium')
          ]}>
            {cardData.cardNumber}
          </Text>

          {/* Card Info */}
          <View style={styles.cardFooter}>
            <View>
              <Text style={[
                styles.cardLabel,
                createTextStyle(currentLanguage, { fontSize: 12 }, 'regular')
              ]}>
                {t('card.info.cardHolder')}
              </Text>
              <Text style={[
                styles.cardValue,
                createTextStyle(currentLanguage, { fontSize: 14 }, 'medium')
              ]}>
                {cardData.cardName}
              </Text>
            </View>
            <View>
              <Text style={[
                styles.cardLabel,
                createTextStyle(currentLanguage, { fontSize: 12 }, 'regular')
              ]}>
                {t('card.info.expires')}
              </Text>
              <Text style={[
                styles.cardValue,
                createTextStyle(currentLanguage, { fontSize: 14 }, 'medium')
              ]}>
                {cardData.expiryDate}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBalanceSection = () => (
    <View style={styles.balanceSection}>
      <View style={styles.balanceCard}>
        <Text style={[
          styles.balanceLabel,
          createTextStyle(currentLanguage, { fontSize: 16 }, 'medium'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          {t('card.info.currentBalance')}
        </Text>
        <Text style={[
          styles.balanceAmount,
          createTextStyle(currentLanguage, { fontSize: 32 }, 'bold'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          ${cardData.balance.toFixed(2)}
        </Text>
      </View>

      <View style={styles.pointsCard}>
        <Text style={[
          styles.pointsLabel,
          createTextStyle(currentLanguage, { fontSize: 16 }, 'medium'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          {t('card.info.rewardPoints')}
        </Text>
        <Text style={[
          styles.pointsAmount,
          createTextStyle(currentLanguage, { fontSize: 24 }, 'bold'),
          { textAlign: getTextAlign(currentLanguage) }
        ]}>
          {cardData.points.toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderCliqSection = () => (
    <View style={styles.cliqSection}>
      <Text style={[
        styles.sectionTitle,
        createTextStyle(currentLanguage, { fontSize: 18 }, 'semiBold'),
        { textAlign: getTextAlign(currentLanguage) }
      ]}>
        {t('card.info.cliqInfo')}
      </Text>
      
      <View style={styles.cliqCard}>
        <View style={styles.cliqIcon}>
          <Text style={styles.cliqIconText}>💳</Text>
        </View>
        <View style={styles.cliqDetails}>
          <Text style={[
            styles.cliqLabel,
            createTextStyle(currentLanguage, { fontSize: 14 }, 'regular'),
            { textAlign: getTextAlign(currentLanguage) }
          ]}>
            {t('card.info.cliqName')}
          </Text>
          <Text style={[
            styles.cliqValue,
            createTextStyle(currentLanguage, { fontSize: 18 }, 'bold'),
            { textAlign: getTextAlign(currentLanguage) }
          ]}>
            {cardData.cliqName}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActionButtons = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.primaryButton} onPress={handleTopUp}>
        <Text style={[
          styles.primaryButtonText,
          createTextStyle(currentLanguage, { fontSize: 16 }, 'semiBold')
        ]}>
          {t('card.info.topUp')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleTransactionHistory}>
        <Text style={[
          styles.secondaryButtonText,
          createTextStyle(currentLanguage, { fontSize: 16 }, 'semiBold')
        ]}>
          {t('card.info.transactionHistory')}
        </Text>
      </TouchableOpacity>

      {!cardData.isActive && (
        <TouchableOpacity style={styles.applyButton} onPress={handleApplyForCard}>
          <Text style={[
            styles.applyButtonText,
            createTextStyle(currentLanguage, { fontSize: 16 }, 'semiBold')
          ]}>
            {t('card.info.applyForCard')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[
            styles.title,
            createTextStyle(currentLanguage, { fontSize: 24 }, 'bold'),
            { textAlign: getTextAlign(currentLanguage) }
          ]}>
            {t('card.info.title')}
          </Text>
          <Text style={[
            styles.subtitle,
            createTextStyle(currentLanguage, { fontSize: 16 }, 'regular'),
            { textAlign: getTextAlign(currentLanguage) }
          ]}>
            {t('card.info.subtitle')}
          </Text>
        </View>

        {/* Card Visual */}
        {renderCardVisual()}

        {/* Balance and Points */}
        {renderBalanceSection()}

        {/* Cliq Information */}
        {renderCliqSection()}

        {/* Action Buttons */}
        {renderActionButtons()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  title: {
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.gray[600],
  },
  cardContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  card: {
    width: width * 0.85,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    flex: 1,
    backgroundColor: colors.primary[500],
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBrand: {
    color: colors.white,
  },
  cardChip: {
    width: 40,
    height: 30,
    backgroundColor: colors.gray[300],
    borderRadius: 4,
  },
  cardNumber: {
    color: colors.white,
    letterSpacing: 2,
    marginTop: spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: colors.primary[100],
    marginBottom: spacing.xs,
  },
  cardValue: {
    color: colors.white,
  },
  balanceSection: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  balanceCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  balanceAmount: {
    color: colors.success[600],
  },
  pointsCard: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pointsLabel: {
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  pointsAmount: {
    color: colors.primary[600],
  },
  cliqSection: {
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.gray[800],
    marginBottom: spacing.md,
  },
  cliqCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cliqIcon: {
    width: 50,
    height: 50,
    backgroundColor: colors.primary[50],
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cliqIconText: {
    fontSize: 24,
  },
  cliqDetails: {
    flex: 1,
  },
  cliqLabel: {
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  cliqValue: {
    color: colors.gray[900],
  },
  actionsSection: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.white,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[500],
  },
  secondaryButtonText: {
    color: colors.primary[500],
  },
  applyButton: {
    backgroundColor: colors.success[500],
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: colors.success[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  applyButtonText: {
    color: colors.white,
  },
});

export default CardInfoScreen;
