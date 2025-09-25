// Driver dashboard screen with ride requests and status management
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import { Driver, DriverRideRequest, DriverStatus, RideOrder } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';
import { driverService } from '../../services/driverService';
import { locationService } from '../../services/locationService';

interface DriverDashboardScreenProps {
  navigation: any;
}

export const DriverDashboardScreen: React.FC<DriverDashboardScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [driverProfile, setDriverProfile] = useState<Driver | null>(null);
  const [rideRequests, setRideRequests] = useState<DriverRideRequest[]>([]);
  const [currentRide, setCurrentRide] = useState<RideOrder | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      initializeDriver();
    }
  }, [user]);

  useEffect(() => {
    let unsubscribeRequests: (() => void) | null = null;
    let unsubscribeCurrentRide: (() => void) | null = null;

    if (driverProfile?.id) {
      // Subscribe to ride requests
      unsubscribeRequests = driverService.subscribeToDriverRideRequests(
        driverProfile.id,
        setRideRequests
      );

      // Subscribe to current ride
      unsubscribeCurrentRide = driverService.subscribeToDriverCurrentRide(
        driverProfile.id,
        setCurrentRide
      );

      // Start location tracking if online
      if (isOnline) {
        startLocationTracking();
      }
    }

    return () => {
      unsubscribeRequests?.();
      unsubscribeCurrentRide?.();
      locationService.stopLocationTracking();
    };
  }, [driverProfile, isOnline]);

  const initializeDriver = async () => {
    try {
      setLoading(true);
      
      // Get or create driver profile
      let profile = await driverService.getDriverProfile(user!.id);
      
      if (!profile) {
        // Create new driver profile
        const newDriverData: Partial<Driver> = {
          id: user!.id,
          name: user!.displayName || user!.phoneNumber || 'Driver',
          phone: user!.phoneNumber || '',
          email: user!.email,
          rating: 5.0,
          totalRides: 0,
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            plateNumber: 'ABC-123',
          },
          location: {
            lat: 31.9454,
            lng: 35.9284,
          },
          status: 'offline',
          isOnline: false,
          isAvailable: false,
        };

        await driverService.createOrUpdateDriverProfile(newDriverData);
        profile = await driverService.getDriverProfile(user!.id);
      }

      setDriverProfile(profile);
      setIsOnline(profile?.isOnline || false);

      // Get earnings
      const driverEarnings = await driverService.getDriverEarnings(user!.id);
      setEarnings(driverEarnings);
    } catch (error) {
      console.error('Error initializing driver:', error);
      Alert.alert('Error', 'Failed to initialize driver profile');
    } finally {
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      await locationService.startLocationTracking(user!.id, 'driver', currentRide?.id);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const handleToggleOnlineStatus = async () => {
    if (!driverProfile) return;

    try {
      const newStatus: DriverStatus = isOnline ? 'offline' : 'online';
      const newIsOnline = !isOnline;

      await driverService.updateDriverStatus(driverProfile.id, newStatus, newIsOnline);
      setIsOnline(newIsOnline);

      if (newIsOnline) {
        startLocationTracking();
      } else {
        locationService.stopLocationTracking();
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAcceptRide = async (request: DriverRideRequest) => {
    try {
      setLoading(true);
      await driverService.acceptRideRequest(request.id, driverProfile!.id);
      Alert.alert('Success', 'Ride request accepted!');
    } catch (error) {
      console.error('Error accepting ride:', error);
      Alert.alert('Error', 'Failed to accept ride request');
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineRide = async (request: DriverRideRequest) => {
    try {
      await driverService.declineRideRequest(request.id, 'Driver declined');
    } catch (error) {
      console.error('Error declining ride:', error);
      Alert.alert('Error', 'Failed to decline ride request');
    }
  };

  const handleUpdateRideStatus = async (status: string) => {
    if (!currentRide || !driverProfile) return;

    try {
      const currentLocation = await locationService.getCurrentLocation();
      await driverService.updateRideStatus(
        currentRide.id,
        driverProfile.id,
        status as any,
        currentLocation,
        `Driver updated status to ${status}`
      );
    } catch (error) {
      console.error('Error updating ride status:', error);
      Alert.alert('Error', 'Failed to update ride status');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await initializeDriver();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} JOD`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return colors.success[500];
      case 'busy':
        return colors.warning[500];
      case 'offline':
        return colors.gray[500];
      default:
        return colors.gray[500];
    }
  };

  const getRideStatusActions = () => {
    if (!currentRide) return null;

    switch (currentRide.status) {
      case 'assigned':
        return (
          <View style={styles.rideActions}>
            <Button
              title="Arriving at Pickup"
              onPress={() => handleUpdateRideStatus('driver_arriving')}
              style={[styles.actionButton, { backgroundColor: colors.info[500] }]}
            />
          </View>
        );
      case 'driver_arriving':
        return (
          <View style={styles.rideActions}>
            <Button
              title="Arrived at Pickup"
              onPress={() => handleUpdateRideStatus('driver_arrived')}
              style={[styles.actionButton, { backgroundColor: colors.warning[500] }]}
            />
          </View>
        );
      case 'driver_arrived':
        return (
          <View style={styles.rideActions}>
            <Button
              title="Start Ride"
              onPress={() => handleUpdateRideStatus('picked_up')}
              style={[styles.actionButton, { backgroundColor: colors.success[500] }]}
            />
          </View>
        );
      case 'picked_up':
      case 'in_progress':
        return (
          <View style={styles.rideActions}>
            <Button
              title="Complete Ride"
              onPress={() => handleUpdateRideStatus('completed')}
              style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}
            />
          </View>
        );
      default:
        return null;
    }
  };

  if (loading && !driverProfile) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading driver dashboard...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>
              {driverProfile?.name || 'Driver'}
            </Text>
            <Text style={styles.driverRating}>
              ⭐ {driverProfile?.rating.toFixed(1)} • {driverProfile?.totalRides} rides
            </Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Online</Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnlineStatus}
              trackColor={{ false: colors.gray[300], true: colors.success[200] }}
              thumbColor={isOnline ? colors.success[500] : colors.gray[500]}
            />
          </View>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(driverProfile?.status || 'offline') }
            ]}
          />
          <Text style={styles.statusText}>
            {isOnline ? 'Online - Ready for rides' : 'Offline'}
          </Text>
        </View>

        {/* Earnings Summary */}
        <View style={styles.earningsContainer}>
          <Text style={styles.sectionTitle}>Today's Earnings</Text>
          <View style={styles.earningsGrid}>
            <View style={styles.earningCard}>
              <Text style={styles.earningAmount}>{formatCurrency(earnings.today)}</Text>
              <Text style={styles.earningLabel}>Today</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningAmount}>{formatCurrency(earnings.week)}</Text>
              <Text style={styles.earningLabel}>This Week</Text>
            </View>
            <View style={styles.earningCard}>
              <Text style={styles.earningAmount}>{formatCurrency(earnings.month)}</Text>
              <Text style={styles.earningLabel}>This Month</Text>
            </View>
          </View>
        </View>

        {/* Current Ride */}
        {currentRide && (
          <View style={styles.currentRideContainer}>
            <Text style={styles.sectionTitle}>Current Ride</Text>
            <View style={styles.rideCard}>
              <View style={styles.rideHeader}>
                <Text style={styles.rideStatus}>{currentRide.status.replace('_', ' ').toUpperCase()}</Text>
                <Text style={styles.ridePrice}>{formatCurrency(currentRide.pricing.total)}</Text>
              </View>
              
              <View style={styles.rideLocations}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText}>{currentRide.pickup.address}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>🎯</Text>
                  <Text style={styles.locationText}>{currentRide.destination.address}</Text>
                </View>
              </View>

              {getRideStatusActions()}
            </View>
          </View>
        )}

        {/* Ride Requests */}
        {rideRequests.length > 0 && (
          <View style={styles.requestsContainer}>
            <Text style={styles.sectionTitle}>Ride Requests</Text>
            {rideRequests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestPrice}>{formatCurrency(request.pricing.total)}</Text>
                  <Text style={styles.requestDistance}>
                    {request.estimatedDistance.toFixed(1)} km • {request.estimatedDuration} min
                  </Text>
                </View>
                
                <View style={styles.requestLocations}>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>{request.pickup.address}</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Text style={styles.locationIcon}>🎯</Text>
                    <Text style={styles.locationText}>{request.destination.address}</Text>
                  </View>
                </View>

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.requestButton, styles.declineButton]}
                    onPress={() => handleDeclineRide(request)}
                  >
                    <Text style={styles.declineButtonText}>Decline</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.requestButton, styles.acceptButton]}
                    onPress={() => handleAcceptRide(request)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Requests Message */}
        {isOnline && rideRequests.length === 0 && !currentRide && (
          <View style={styles.noRequestsContainer}>
            <Text style={styles.noRequestsText}>🚗</Text>
            <Text style={styles.noRequestsTitle}>Waiting for ride requests</Text>
            <Text style={styles.noRequestsSubtitle}>
              You're online and ready to receive ride requests
            </Text>
          </View>
        )}

        {/* Offline Message */}
        {!isOnline && (
          <View style={styles.offlineContainer}>
            <Text style={styles.offlineText}>📴</Text>
            <Text style={styles.offlineTitle}>You're offline</Text>
            <Text style={styles.offlineSubtitle}>
              Turn on online status to start receiving ride requests
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...textStyles.body1,
    color: colors.gray[600],
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...textStyles.h3,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  driverRating: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusLabel: {
    ...textStyles.caption,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    ...textStyles.body1,
    color: colors.gray[700],
  },
  sectionTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  earningsContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  earningsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    marginHorizontal: spacing.xs,
  },
  earningAmount: {
    ...textStyles.h4,
    color: colors.primary[600],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  earningLabel: {
    ...textStyles.caption,
    color: colors.gray[600],
  },
  currentRideContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  rideCard: {
    backgroundColor: colors.success[50],
    borderRadius: 12,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.success[500],
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rideStatus: {
    ...textStyles.body1,
    fontWeight: 'bold',
    color: colors.success[700],
  },
  ridePrice: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: 'bold',
  },
  rideLocations: {
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  locationText: {
    ...textStyles.body2,
    color: colors.gray[700],
    flex: 1,
  },
  rideActions: {
    marginTop: spacing.sm,
  },
  actionButton: {
    borderRadius: 8,
  },
  requestsContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  requestCard: {
    backgroundColor: colors.info[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.info[500],
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestPrice: {
    ...textStyles.h4,
    color: colors.gray[900],
    fontWeight: 'bold',
  },
  requestDistance: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  requestLocations: {
    marginBottom: spacing.md,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  requestButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  acceptButton: {
    backgroundColor: colors.success[500],
  },
  acceptButtonText: {
    ...textStyles.body1,
    color: colors.white,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: colors.gray[200],
  },
  declineButtonText: {
    ...textStyles.body1,
    color: colors.gray[700],
    fontWeight: '600',
  },
  noRequestsContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  noRequestsText: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noRequestsTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  noRequestsSubtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
  },
  offlineContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.lg,
  },
  offlineText: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  offlineTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  offlineSubtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
    textAlign: 'center',
  },
});

export default DriverDashboardScreen;
