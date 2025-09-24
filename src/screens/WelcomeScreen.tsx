import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import { Screen, Button, Logo, ServiceIcon } from '../components/ui';
import { useAppDispatch, useAppSelector } from '../store';
import { signOut } from '../store/slices/authSlice';
import { colors, textStyles, spacing } from '../theme';

const { width } = Dimensions.get('window');

// Service icons data
interface ServiceItem {
  id: string;
  icon: string;
  title: string;
  description: string;
  route?: string;
  comingSoon?: boolean;
}

const services: ServiceItem[] = [
  {
    id: 'ride-order',
    icon: '🚕',
    title: 'Ride Order',
    description: 'Book a taxi ride',
    route: 'BookRide',
  },
  {
    id: 'food-order',
    icon: '🍔',
    title: 'Food Order',
    description: 'Order food delivery',
    comingSoon: true,
  },
  {
    id: 'yellowtaxi-card',
    icon: '💳',
    title: 'YellowTaxi Card',
    description: 'Manage your card',
    comingSoon: true,
  },
  {
    id: 'package-delivery',
    icon: '📦',
    title: 'Package Delivery',
    description: 'Send packages',
    comingSoon: true,
  },
  {
    id: 'become-driver',
    icon: '🚗',
    title: 'Become Driver',
    description: 'Start earning',
    comingSoon: true,
  },
  {
    id: 'manage-profile',
    icon: '👤',
    title: 'Profile',
    description: 'Account settings',
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

  return (
    <Screen>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Logo size={80} />
          </View>
          <Text style={styles.greeting}>{getGreeting()}!</Text>
          <Text style={styles.welcomeTitle}>Welcome to YellowTaxi</Text>
          <Text style={styles.welcomeSubtitle}>
            Your ride is just a tap away
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>24/7</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>5★</Text>
            <Text style={styles.statLabel}>Rated</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>Fast</Text>
            <Text style={styles.statLabel}>Pickup</Text>
          </View>
        </View>

        {/* Account Info Card */}
        <View style={styles.accountCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Your Account</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          </View>

          <View style={styles.accountInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>
                {formatPhoneNumber(user?.phoneNumber || null)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Services Grid */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <View style={styles.servicesGrid}>
            {services.map((service) => (
              <ServiceIcon
                key={service.id}
                icon={service.icon}
                title={service.title}
                description={service.description}
                onPress={() => handleServicePress(service)}
                style={styles.serviceItem}
                testID={`service-${service.id}`}
              />
            ))}
          </View>
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

  // Hero Section
  heroSection: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    marginBottom: spacing.lg,
  },

  logoContainer: {
    marginBottom: spacing.lg,
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  greeting: {
    ...textStyles.h4,
    color: colors.primary[600],
    fontWeight: '500',
    marginBottom: spacing.xs,
  },

  welcomeTitle: {
    ...textStyles.h1,
    color: colors.gray[900],
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },

  welcomeSubtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.sm,
  },

  statCard: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    flex: 1,
    marginHorizontal: spacing.xs,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  statNumber: {
    ...textStyles.h3,
    color: colors.primary[600],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },

  statLabel: {
    ...textStyles.caption,
    color: colors.gray[600],
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Account Card
  accountCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  cardTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: '600',
  },

  verifiedBadge: {
    backgroundColor: colors.success[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.success[100],
  },

  verifiedText: {
    ...textStyles.caption,
    color: colors.success[700],
    fontWeight: '600',
  },

  accountInfo: {
    gap: spacing.lg,
  },

  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    ...textStyles.body2,
    color: colors.gray[600],
    fontWeight: '500',
  },

  infoValue: {
    ...textStyles.body2,
    color: colors.gray[900],
    fontWeight: '600',
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
