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
  description: string;
  route?: string;
  comingSoon?: boolean;
}

const services: ServiceItem[] = [
  {
    id: 'ride-order',
    imageSource: require('../assets/images/yellowtax-icon.png'),
    title: 'Ride Order',
    description: 'Book a taxi ride',
    route: 'BookRide',
  },
  {
    id: 'food-order',
    imageSource: require('../assets/images/food-icon.png'),
    title: 'Food Order',
    description: 'Order food delivery',
    comingSoon: true,
  },
  {
    id: 'yellowtaxi-card',
    imageSource: require('../assets/images/credit-card-icon.png'),
    title: 'YellowTaxi Card',
    description: 'Manage your card',
    comingSoon: true,
  },
  {
    id: 'become-driver',
    imageSource: require('../assets/images/taxi-driver.png'),
    title: 'Become Driver',
    description: 'Start earning',
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

  const formatPhoneNumber = (phoneNumber: string | null) => {
    if (!phoneNumber) return 'Unknown';

    // Format phone number for display
    if (phoneNumber.startsWith('+1') && phoneNumber.length === 12) {
      // US format: +1 (XXX) XXX-XXXX
      const digits = phoneNumber.slice(2);
      return `+1 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }

    return phoneNumber;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
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
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        <SearchBar
          placeholder="Where to?"
          onSearchPress={handleSearchPress}
          style={styles.searchBar}
        />

        {/* Welcome Greeting */}
        <Text style={styles.welcomeGreeting}>
          {getGreeting()}, {user?.phoneNumber ? 'Welcome back!' : 'Welcome!'}
        </Text>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceIcon
                key={service.id}
                icon={service.icon}
                imageSource={service.imageSource}
                title={service.title}
                description={service.description}
                onPress={() => handleServicePress(service)}
                style={styles.serviceItem}
              />
            ))}
          </View>
        </View>

        {/* YellowTaxi Card Promotional Banner */}
        <View style={styles.promoSection}>
          <Text style={styles.promoHeadline}>
            Apply for YellowTaxi Card and Get Discount
          </Text>
          <Image
            source={require('../assets/images/big-yellowtaxi-card.png')}
            style={styles.promoImage}
            resizeMode="contain"
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.successBadge}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successText}>Authentication Successful</Text>
          </View>

          <Button
            title="Sign Out"
            variant="outline"
            onPress={handleSignOut}
            fullWidth
            testID="sign-out-button"
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Search Bar
  searchBar: {
    marginBottom: spacing.lg,
  },

  // Welcome Greeting
  welcomeGreeting: {
    ...textStyles.body1,
    color: colors.gray[700],
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  // Services Section
  servicesSection: {
    marginBottom: spacing.xl,
  },

  sectionTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: '600',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },

  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },

  serviceItem: {
    width: (width - spacing.lg * 2 - spacing.sm * 2 - spacing.md) / 2,
    marginBottom: spacing.lg,
  },

  // Promotional Section
  promoSection: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  promoHeadline: {
    ...textStyles.h3,
    color: colors.gray[900],
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 28,
  },

  promoImage: {
    width: width - spacing.lg * 4,
    height: 200,
  },

  // Footer
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },

  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.success[100],
  },

  successIcon: {
    ...textStyles.body1,
    color: colors.success[600],
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },

  successText: {
    ...textStyles.body2,
    color: colors.success[700],
    fontWeight: '600',
  },
});
