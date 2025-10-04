import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ImageBackground,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';

import { Screen, Button, Logo, ServiceIcon, SearchBar } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { signOut } from '../store/slices/authSlice';
import { colors, textStyles, spacing } from '../theme';
import { useLanguage } from '../contexts/LanguageContext';
import { createTextStyle, getTextAlign } from '../utils/fonts';

// Location test disabled to prevent crashes
// Uncomment to enable location testing:
// if (__DEV__) {
//   require('../utils/locationTest');
// }

const { width } = Dimensions.get('window');

// Service icons data
interface ServiceItem {
  id: string;
  icon?: string;
  imageSource?: any;
  title: string;
  description?: string;
  route?: string;
  comingSoon?: boolean;
  iconSize?: number;
}

// Services will be generated dynamically with translations

interface WelcomeScreenProps {
  navigation?: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, isRTL } = useLanguage();

  // Generate services array with translations
  const services: ServiceItem[] = [
    {
      id: 'transport',
      imageSource: require('../assets/images/yellowtax-icon.png'),
      title: t('welcome.services.rides'),
      route: 'BookRide',
      iconSize: 86,
    },
    {
      id: 'mart',
      imageSource: require('../assets/images/credit-card-icon.png'),
      title: t('welcome.services.yellowTaxiCard'),
      route: 'CardInfo',
    },
    {
      id: 'express',
      imageSource: require('../assets/images/taxi-driver.png'),
      title: t('welcome.services.becomeDriver'),
      route: 'BecomeDriver',
    },
  ];

  const handleSignOut = async () => {
    Alert.alert(
      t('welcome.signOut.title'),
      t('welcome.signOut.message'),
      [
        {
          text: t('welcome.signOut.cancel'),
          style: 'cancel',
        },
        {
          text: t('welcome.signOut.signOut'),
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch (error) {
              Alert.alert(
                t('common.error'),
                typeof error === 'string' ? error : t('welcome.signOut.error')
              );
            }
          },
        },
      ]
    );
  };

  const handleLanguageSwitch = async () => {
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    await changeLanguage(newLanguage);
  };

  const handleServicePress = (service: ServiceItem) => {
    if (service.route && navigation) {
      navigation.navigate(service.route);
    } else {
      Alert.alert(
        t('welcome.services.comingSoon'),
        t('welcome.services.comingSoonMessage', { service: service.title }),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleSearchPress = () => {
    Alert.alert(
      t('common.search'),
      t('welcome.services.comingSoonMessage', { service: t('common.search') }),
      [{ text: t('common.ok') }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Background Image */}
        <ImageBackground
          source={require('../assets/images/yellowtaxi-background-pro.jpg')}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            {/* Language Switcher */}
            <TouchableOpacity 
              style={[
                styles.languageSwitcher,
                isRTL ? { left: spacing.lg, right: 'auto' } : { right: spacing.lg, left: 'auto' }
              ]} 
              onPress={handleLanguageSwitch}
            >
              <View style={styles.languageIcon}>
                <Text style={styles.languageIconText}>
                  {currentLanguage === 'ar' ? 'EN' : 'ع'}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={createTextStyle(currentLanguage, styles.headerTitle, 'bold')}>
                {t('welcome.header.title')}
              </Text>
              <Text style={createTextStyle(currentLanguage, styles.headerTitle, 'bold')}>
                {t('welcome.header.subtitle')}
              </Text>
              <View style={[
                styles.headerSubtitleContainer,
                isRTL && { flexDirection: 'row-reverse' }
              ]}>
                <Text style={createTextStyle(currentLanguage, styles.headerSubtitle)}>
                  {t('welcome.header.description')}
                </Text>
                <TouchableOpacity style={styles.headerArrow}>
                  <Text style={styles.headerArrowText}>{isRTL ? '←' : '→'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
            <View style={styles.searchIcon}>
              <View style={styles.searchIconCircle} />
              <View style={styles.searchIconHandle} />
            </View>
            <Text style={createTextStyle(currentLanguage, styles.searchText)}>
              {t('welcome.search.placeholder')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Row */}
        <View style={styles.servicesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesRow}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => handleServicePress(service)}
              >
                <View style={styles.serviceIconContainer}>
                  <View style={styles.gradientCircle} />
                  <Image
                    source={service.imageSource}
                    style={[styles.serviceIcon, service.iconSize ? { width: service.iconSize, height: service.iconSize } : null]}
                    resizeMode="contain"
                  />
                </View>
                <Text style={createTextStyle(currentLanguage, styles.serviceTitle, 'medium')}>
                  {service.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Balance Section */}
        <View style={[
          styles.balanceSection,
          isRTL && { flexDirection: 'row-reverse' }
        ]}>
          <View style={styles.balanceItem}>
            <Text style={createTextStyle(currentLanguage, styles.balanceLabel)}>
              {t('welcome.balance.balance')}
            </Text>
            <View style={[
              styles.balanceValueContainer,
              isRTL && { flexDirection: 'row-reverse' }
            ]}>
              <Text style={createTextStyle(currentLanguage, styles.balanceValue, 'semiBold')}>
                0.00 JOD
              </Text>
              <View style={styles.balanceIcon}>
                <Text style={styles.balanceIconText}>د.أ</Text>
              </View>
            </View>
          </View>

          <View style={styles.balanceItem}>
            <Text style={createTextStyle(currentLanguage, styles.balanceLabel)}>
              {t('welcome.balance.usePoints')}
            </Text>
            <Text style={createTextStyle(currentLanguage, styles.balanceValue, 'semiBold')}>
              4,291
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[
            styles.applyNowContainer,
            isRTL && { flexDirection: 'row-reverse' }
          ]} 
          activeOpacity={0.8}
          onPress={() => navigation?.navigate('ApplyCard')}
        >
          <Text style={createTextStyle(currentLanguage, styles.applyNowText, 'semiBold')}>
            {t('welcome.balance.applyNow')}
          </Text>
          <Text style={styles.applyNowArrow}>{isRTL ? '←' : '→'}</Text>
        </TouchableOpacity>

        {/* YellowTaxi Card Promotional Banner */}
        <View style={styles.promoCard}>
          <Image
            source={require('../assets/images/big-yellowtaxi-card.png')}
            style={styles.promoImage}
            resizeMode="cover"
          />
          <View style={styles.promoCopyContainer}>
            <Text style={createTextStyle(currentLanguage, styles.promoHeadline, 'bold')}>
              {t('welcome.promo.headline')}
            </Text>
            <Text style={createTextStyle(currentLanguage, styles.promoSubtext)}>
              {t('welcome.promo.subtext')}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={createTextStyle(currentLanguage, styles.logoutButtonText, 'semiBold')}>
              {t('welcome.logout')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header Section
  headerBackground: {
    height: 180,
    marginBottom: -20,
  },

  headerBackgroundImage: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  headerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 50,
  },

  headerContent: {
    flex: 1,
  },

  languageSwitcher: {
    position: 'absolute',
    top: 50,
    right: spacing.lg,
    zIndex: 10,
  },

  languageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  languageIconText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },

  headerTitle: {
    ...textStyles.h4,
    color: colors.white,
    fontWeight: 'bold',
    lineHeight: 24,
  },

  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },

  headerSubtitle: {
    ...textStyles.body2,
    color: colors.white,
    opacity: 0.9,
  },

  headerArrow: {
    marginLeft: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerArrowText: {
    color: colors.white,
    fontSize: 14,
  },

  // Search Section
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    zIndex: 1,
  },

  searchBar: {
    backgroundColor: colors.white,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  searchIcon: {
    marginRight: spacing.md,
    position: 'relative',
    width: 18,
    height: 18,
  },

  searchIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.gray[400],
  },

  searchIconHandle: {
    width: 8,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gray[400],
    position: 'absolute',
    right: -1,
    bottom: 2,
    transform: [{ rotate: '45deg' }],
  },

  searchText: {
    ...textStyles.body1,
    color: colors.gray[500],
    flex: 1,
  },

  qrIcon: {
    padding: spacing.xs,
  },

  qrIconText: {
    fontSize: 20,
    color: colors.gray[600],
  },

  // Services Section
  servicesContainer: {
    marginBottom: spacing.lg,
  },

  servicesRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },

  serviceItem: {
    alignItems: 'center',
    minWidth: 70,
  },

  serviceIconContainer: {
    width: 88,
    height: 88,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    position: 'relative',
  },

  gradientCircle: {
    position: 'absolute',
    width: 55,
    height: 55,
    borderRadius: 36,
    backgroundColor: colors.primary[400],
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },

  serviceIcon: {
    width: 80,
    height: 80,
    zIndex: 2,
  },

  serviceTitle: {
    ...textStyles.caption,
    color: colors.gray[700],
    fontWeight: '500',
    textAlign: 'center',
  },

  // Balance Section
  balanceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },

  balanceItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary[200],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  balanceLabel: {
    ...textStyles.caption,
    color: colors.gray[600],
    marginBottom: spacing.xs,
    textAlign: 'center',
  },

  balanceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  balanceValue: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
  },

  balanceIcon: {
    minWidth: 24,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  balanceIconText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: 'bold',
  },

  // Apply Now Section
  applyNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },

  applyNowText: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
  },

  applyNowArrow: {
    color: colors.primary[500],
    fontSize: 18,
    fontWeight: '600',
  },

  // Promotional Card
  promoCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    padding: spacing.lg,
    gap: spacing.md,
  },

  promoImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },

  promoCopyContainer: {
    gap: spacing.xs,
  },

  promoHeadline: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: '700',
  },

  promoSubtext: {
    ...textStyles.body2,
    color: colors.gray[700],
  },

  // Logout Button (moved from header)
  logoutContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  logoutButton: {
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.gray[300],
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  logoutButtonText: {
    ...textStyles.body1,
    color: colors.gray[700],
    textAlign: 'center',
  },
});
