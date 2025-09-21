import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  cancelRideRequest,
  selectCurrentRide,
  selectActiveRequest,
  selectRideLoading,
  selectRideError,
  clearError,
} from '../../store/slices/rideSlice';
import { colors, textStyles, spacing } from '../../theme';

interface RideTrackingScreenProps {
  navigation: any;
}

export const RideTrackingScreen: React.FC<RideTrackingScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const currentRide = useAppSelector(selectCurrentRide);
  const activeRequest = useAppSelector(selectActiveRequest);
  const loading = useAppSelector(selectRideLoading);
  const error = useAppSelector(selectRideError);

  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulse animation for searching state
  useEffect(() => {
    if (activeRequest?.status === 'pending') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [activeRequest?.status, pulseAnim]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  // Navigate back if no active ride or request
  useEffect(() => {
    if (!currentRide && !activeRequest) {
      navigation.goBack();
    }
  }, [currentRide, activeRequest, navigation]);

  const handleCancelRequest = () => {
    if (!activeRequest) return;

    Alert.alert(
      'Cancel Ride Request',
      'Are you sure you want to cancel your ride request?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelRideRequest({
                requestId: activeRequest.id!,
                reason: 'Cancelled by customer'
              })).unwrap();
              navigation.goBack();
            } catch (error) {
              console.error('Failed to cancel ride request:', error);
            }
          },
        },
      ]
    );
  };

  const getStatusMessage = () => {
    if (activeRequest) {
      switch (activeRequest.status) {
        case 'pending':
          return 'Looking for nearby drivers...';
        case 'accepted':
          return 'Driver found! Preparing your ride...';
        case 'expired':
          return 'Request expired. Please try again.';
        case 'cancelled':
          return 'Request cancelled.';
        default:
          return 'Processing your request...';
      }
    }

    if (currentRide) {
      switch (currentRide.status) {
        case 'assigned':
          return 'Driver assigned! They are on their way.';
        case 'driver_arriving':
          return 'Driver is arriving at pickup location.';
        case 'driver_arrived':
          return 'Driver has arrived at pickup location.';
        case 'picked_up':
          return 'You have been picked up. Enjoy your ride!';
        case 'in_progress':
          return 'Ride in progress. Heading to destination.';
        case 'completed':
          return 'Ride completed successfully!';
        case 'cancelled':
          return 'Ride was cancelled.';
        default:
          return 'Processing your ride...';
      }
    }

    return 'Loading...';
  };

  const getStatusIcon = () => {
    if (activeRequest?.status === 'pending') {
      return '🔍';
    }
    if (currentRide) {
      switch (currentRide.status) {
        case 'assigned':
        case 'driver_arriving':
          return '🚗';
        case 'driver_arrived':
          return '📍';
        case 'picked_up':
        case 'in_progress':
          return '🚕';
        case 'completed':
          return '✅';
        case 'cancelled':
          return '❌';
        default:
          return '⏳';
      }
    }
    return '⏳';
  };

  const renderDriverInfo = () => {
    if (!currentRide?.driver) return null;

    const { driver } = currentRide;
    return (
      <View style={styles.driverCard}>
        <View style={styles.driverHeader}>
          <View style={styles.driverAvatar}>
            <Text style={styles.driverAvatarText}>
              {driver.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={styles.driverRating}>⭐ {driver.rating.toFixed(1)}</Text>
          </View>
          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>📞</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.vehicleInfo}>
          <Text style={styles.vehicleText}>
            {driver.vehicle.color} {driver.vehicle.make} {driver.vehicle.model}
          </Text>
          <Text style={styles.plateText}>{driver.vehicle.plateNumber}</Text>
        </View>
      </View>
    );
  };

  const renderRideDetails = () => {
    const ride = currentRide || activeRequest;
    if (!ride) return null;

    return (
      <View style={styles.rideDetailsCard}>
        <Text style={styles.cardTitle}>Ride Details</Text>
        
        <View style={styles.locationRow}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText} numberOfLines={2}>
            {ride.pickup.address}
          </Text>
        </View>
        
        <View style={styles.locationLine} />
        
        <View style={styles.locationRow}>
          <View style={[styles.locationDot, styles.destinationDot]} />
          <Text style={styles.locationText} numberOfLines={2}>
            {ride.destination.address}
          </Text>
        </View>
        
        {ride.pricing && (
          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Total Fare:</Text>
            <Text style={styles.pricingValue}>
              {ride.pricing.total.toFixed(2)} JOD
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen style={styles.container}>
      {/* Status Section */}
      <View style={styles.statusSection}>
        <Animated.View style={[
          styles.statusIconContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
        </Animated.View>
        
        <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
        
        {activeRequest?.status === 'pending' && (
          <Text style={styles.statusSubtext}>
            This usually takes 2-5 minutes
          </Text>
        )}
      </View>

      {/* Driver Info */}
      {renderDriverInfo()}

      {/* Ride Details */}
      {renderRideDetails()}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {activeRequest?.status === 'pending' && (
          <Button
            title="Cancel Request"
            onPress={handleCancelRequest}
            disabled={loading}
            style={styles.cancelButton}
            textStyle={styles.cancelButtonText}
          />
        )}
        
        {currentRide?.status === 'completed' && (
          <Button
            title="Book Another Ride"
            onPress={() => navigation.navigate('RideBooking')}
            style={styles.bookAnotherButton}
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.md,
  },
  statusIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusIcon: {
    fontSize: 40,
  },
  statusMessage: {
    ...textStyles.h3,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  statusSubtext: {
    ...textStyles.body2,
    color: colors.gray[600],
    textAlign: 'center',
  },
  driverCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  driverAvatarText: {
    ...textStyles.h4,
    color: colors.white,
    fontWeight: 'bold',
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  driverRating: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  vehicleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  vehicleText: {
    ...textStyles.body1,
    color: colors.gray[700],
  },
  plateText: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
  },
  rideDetailsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success[500],
    marginRight: spacing.md,
  },
  destinationDot: {
    backgroundColor: colors.error[500],
  },
  locationLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.gray[300],
    marginLeft: 5,
    marginRight: spacing.md,
    marginBottom: spacing.sm,
  },
  locationText: {
    ...textStyles.body1,
    color: colors.gray[700],
    flex: 1,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  pricingLabel: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
  },
  pricingValue: {
    ...textStyles.h4,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  actionSection: {
    padding: spacing.md,
    marginTop: 'auto',
  },
  cancelButton: {
    backgroundColor: colors.error[500],
  },
  cancelButtonText: {
    color: colors.white,
  },
  bookAnotherButton: {
    backgroundColor: colors.primary[500],
  },
});
