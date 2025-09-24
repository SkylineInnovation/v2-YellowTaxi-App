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

import { Screen, Button, Logo, ServiceIcon, SearchBar } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { signOut } from '../store/slices/authSlice';
import { colors, textStyles, spacing } from '../theme';

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
}

const services: ServiceItem[] = [
  {
    id: 'transport',
    imageSource: require('../assets/images/yellowtax-icon.png'),
    title: 'Transport',
    route: 'BookRide',
  },
  {
    id: 'food',
    imageSource: require('../assets/images/food-icon.png'),
    title: 'Food',
    comingSoon: true,
  },
  {
    id: 'mart',
    imageSource: require('../assets/images/credit-card-icon.png'),
    title: 'Mart',
    comingSoon: true,
  },
  {
    id: 'express',
    imageSource: require('../assets/images/taxi-driver.png'),
    title: 'Express',
    comingSoon: true,
  },
];

interface WelcomeScreenProps {
  navigation?: any;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
            } catch (error) {
              Alert.alert(
                'Error',
                typeof error === 'string' ? error : 'Failed to sign out'
              );
            }
          },
        },
      ]
    );
  };


  const handleServicePress = (service: ServiceItem) => {
    if (service.route && navigation) {
      navigation.navigate(service.route);
    } else {
      Alert.alert(
        'Coming Soon',
        `${service.title} feature will be available in the next update!`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleSearchPress = () => {
    Alert.alert(
      'Search',
      'Search functionality will be available soon!',
      [{ text: 'OK' }]
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
          source={{
            uri: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80'
          }}
          style={styles.headerBackground}
          imageStyle={styles.headerBackgroundImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Explore over 1,000</Text>
              <Text style={styles.headerTitle}>rides worldwide</Text>
              <View style={styles.headerSubtitleContainer}>
                <Text style={styles.headerSubtitle}>Exclusively with YellowTaxi Cards</Text>
                <TouchableOpacity style={styles.headerArrow}>
                  <Text style={styles.headerArrowText}>→</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.headerCards}>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>💳</Text>
              </View>
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>💳</Text>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchBar} onPress={handleSearchPress}>
            <View style={styles.searchIcon}>
              <Text style={styles.searchIconText}>🔍</Text>
            </View>
            <Text style={styles.searchText}>Search the YellowTaxi</Text>
            <TouchableOpacity style={styles.qrIcon}>
              <Text style={styles.qrIconText}>⚏</Text>
            </TouchableOpacity>
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
                  <Image source={service.imageSource} style={styles.serviceIcon} resizeMode="contain" />
                </View>
                <Text style={styles.serviceTitle}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <View style={styles.balanceValueContainer}>
              <Text style={styles.balanceValue}>$$ 0.00</Text>
              <View style={styles.balanceIcon}>
                <Text style={styles.balanceIconText}>$</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Ride to</Text>
            <Text style={styles.balanceLabel}>Home</Text>
            <View style={styles.balanceValueContainer}>
              <View style={styles.homeIcon}>
                <Text style={styles.homeIconText}>🏠</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.balanceItem}>
            <Text style={styles.balanceLabel}>Use Points</Text>
            <Text style={styles.balanceValue}>4,291</Text>
          </View>
        </View>

        {/* Apply Now Section */}
        <TouchableOpacity style={styles.applyNowContainer}>
          <Text style={styles.applyNowText}>Apply now</Text>
          <Text style={styles.applyNowArrow}>→</Text>
        </TouchableOpacity>

        {/* YellowTaxi Card Promotional Banner */}
        <View style={styles.promoCard}>
          <ImageBackground
            source={require('../assets/images/big-yellowtaxi-card.png')}
            style={styles.promoBackground}
            imageStyle={styles.promoBackgroundImage}
          >
            <View style={styles.promoOverlay}>
              <Text style={styles.promoTitle}>limitless enjoyment</Text>
              <Text style={styles.promoSubtitle}>with the highest-limits in the card</Text>
              <View style={styles.promoCardImage}>
                <Text style={styles.promoCardText}>YellowTaxi PRIVI Miles Card</Text>
              </View>
            </View>
          </ImageBackground>
          <Text style={styles.promoFooter}>Enjoy over 44,000 miles when you sign up</Text>
          <Text style={styles.promoSponsor}>Sponsored by YellowTaxi PRIVI Miles Card</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
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

  headerCards: {
    flexDirection: 'row',
    gap: spacing.xs,
  },

  cardIcon: {
    width: 40,
    height: 25,
    backgroundColor: colors.primary[500],
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardIconText: {
    fontSize: 12,
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
    paddingVertical: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  searchIcon: {
    marginRight: spacing.md,
  },

  searchIconText: {
    fontSize: 18,
    color: colors.gray[500],
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
    borderRadius: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 0,
  },

  serviceIcon: {
    width: 64,
    height: 64,
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
  },

  balanceItem: {
    flex: 1,
    alignItems: 'center',
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
  },

  balanceValue: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
  },

  balanceIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  balanceIconText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },

  homeIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

  homeIconText: {
    fontSize: 12,
  },

  // Apply Now Section
  applyNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  applyNowText: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
  },

  applyNowArrow: {
    marginLeft: spacing.xs,
    color: colors.primary[500],
    fontSize: 16,
  },

  // Promotional Card
  promoCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  promoBackground: {
    height: 200,
  },

  promoBackgroundImage: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  promoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: spacing.lg,
    justifyContent: 'space-between',
  },

  promoTitle: {
    ...textStyles.h3,
    color: colors.white,
    fontWeight: 'bold',
    fontStyle: 'italic',
  },

  promoSubtitle: {
    ...textStyles.body2,
    color: colors.white,
    opacity: 0.9,
    marginTop: spacing.xs,
  },

  promoCardImage: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: spacing.sm,
    alignSelf: 'flex-start',
  },

  promoCardText: {
    ...textStyles.caption,
    color: colors.white,
    fontWeight: '600',
  },

  promoFooter: {
    ...textStyles.body1,
    color: colors.gray[900],
    fontWeight: '600',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },

  promoSponsor: {
    ...textStyles.caption,
    color: colors.gray[600],
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
