// Enhanced ride tracking screen with real-time updates and driver communication
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Linking,
  Dimensions,
  Animated,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import RideMapView from '../../components/ride/MapView';
import { useAppDispatch, useAppSelector } from '../../store';
import { RideOrder, MapRegion, MapMarker, RideStatus } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';
import { rideService, locationService } from '../../services/rideService';

const { width, height } = Dimensions.get('window');

interface EnhancedRideTrackingScreenProps {
  navigation: any;
}

export const EnhancedRideTrackingScreen: React.FC<EnhancedRideTrackingScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [currentRide, setCurrentRide] = useState<RideOrder | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 31.9454,
    longitude: 35.9284,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (user?.id) {
      // Subscribe to current ride updates
      const unsubscribe = rideService.subscribeToCustomerCurrentRide(
        user.id,
        handleRideUpdate
      );

      // Start location tracking
      startLocationTracking();

      return () => {
        unsubscribe();
        locationService.stopLocationTracking();
      };
    }
  }, [user]);

  useEffect(() => {
    if (currentRide) {
      updateMapRegion();
      animateStatusCard();
      
      // Start pulse animation for waiting states
      if (['searching', 'driver_arriving'].includes(currentRide.status)) {
        startPulseAnimation();
      } else {
        stopPulseAnimation();
      }
    }
  }, [currentRide]);

  const handleRideUpdate = (ride: RideOrder | null) => {
    setCurrentRide(ride);
    
    if (!ride) {
      // Ride completed or cancelled, navigate back
      navigation.goBack();
    }
  };

  const startLocationTracking = async () => {
    try {
      await locationService.startLocationTracking(user!.id, 'customer', currentRide?.id);
      
      // Get current location
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const updateMapRegion = () => {
    if (!currentRide) return;

    const locations = [currentRide.pickup.coordinates];
    
    if (currentRide.destination) {
      locations.push(currentRide.destination.coordinates);
    }
    
    if (currentRide.driver?.location) {
      locations.push(currentRide.driver.location);
    }
    
    if (userLocation) {
      locations.push(userLocation);
    }

    const region = locationService.calculateMapRegion(locations, 0.02);
    setMapRegion(region);
  };

  const animateStatusCard = () => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const getMapMarkers = (): MapMarker[] => {
    const markers: MapMarker[] = [];

    if (userLocation) {
      markers.push({
        id: 'user-location',
        coordinate: {
          latitude: userLocation.lat,
          longitude: userLocation.lng,
        },
        title: 'Your Location',
        type: 'user',
      });
    }

    if (currentRide) {
      markers.push({
        id: 'pickup',
        coordinate: {
          latitude: currentRide.pickup.coordinates.lat,
          longitude: currentRide.pickup.coordinates.lng,
        },
        title: 'Pickup Location',
        description: currentRide.pickup.address,
        type: 'pickup',
      });

      markers.push({
        id: 'destination',
        coordinate: {
          latitude: currentRide.destination.coordinates.lat,
          longitude: currentRide.destination.coordinates.lng,
        },
        title: 'Destination',
        description: currentRide.destination.address,
        type: 'destination',
      });

      if (currentRide.driver?.location) {
        markers.push({
          id: 'driver',
          coordinate: {
            latitude: currentRide.driver.location.lat,
            longitude: currentRide.driver.location.lng,
          },
          title: currentRide.driver.name,
          description: `${currentRide.driver.vehicle.make} ${currentRide.driver.vehicle.model}`,
          type: 'driver',
        });
      }
    }

    return markers;
  };

  const handleCallDriver = () => {
    if (currentRide?.driver?.phone) {
      Linking.openURL(`tel:${currentRide.driver.phone}`);
    }
  };

  const handleCancelRide = () => {
    if (!currentRide) return;

    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await rideService.cancelRide(currentRide.id, user!.id, 'customer', 'Cancelled by customer');
              navigation.goBack();
            } catch (error) {
              console.error('Error cancelling ride:', error);
              Alert.alert('Error', 'Failed to cancel ride');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStatusMessage = (status: RideStatus): string => {
    switch (status) {
      case 'searching':
        return 'Searching for nearby drivers...';
      case 'assigned':
        return 'Driver assigned! They are on their way.';
      case 'driver_arriving':
        return 'Driver is arriving at pickup location';
      case 'driver_arrived':
        return 'Driver has arrived at pickup location';
      case 'picked_up':
        return 'You have been picked up. Enjoy your ride!';
      case 'in_progress':
        return 'Ride in progress to destination';
      case 'completed':
        return 'Ride completed successfully';
      case 'cancelled':
        return 'Ride has been cancelled';
      default:
        return 'Processing your ride request...';
    }
  };

  const getStatusColor = (status: RideStatus): string => {
    switch (status) {
      case 'searching':
        return colors.warning[500];
      case 'assigned':
      case 'driver_arriving':
        return colors.info[500];
      case 'driver_arrived':
        return colors.warning[600];
      case 'picked_up':
      case 'in_progress':
        return colors.success[500];
      case 'completed':
        return colors.primary[500];
      case 'cancelled':
        return colors.error[500];
      default:
        return colors.gray[500];
    }
  };

  const canCancelRide = currentRide && ['searching', 'assigned', 'driver_arriving'].includes(currentRide.status);

  if (!currentRide) {
    return (
      <Screen style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading ride details...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen style={styles.container}>
      {/* Map View */}
      <View style={styles.mapContainer}>
        <RideMapView
          region={mapRegion}
          markers={getMapMarkers()}
          pickup={currentRide.pickup}
          destination={currentRide.destination}
          driverLocation={currentRide.driver}
          showRoute={true}
          onRegionChange={setMapRegion}
          style={styles.map}
        />
      </View>

      {/* Status Card */}
      <Animated.View
        style={[
          styles.statusCard,
          {
            transform: [
              { translateY: slideAnim },
              { scale: pulseAnim },
            ],
          },
        ]}
      >
        {/* Status Header */}
        <View style={styles.statusHeader}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getStatusColor(currentRide.status) }
            ]}
          />
          <Text style={styles.statusText}>
            {getStatusMessage(currentRide.status)}
          </Text>
        </View>

        {/* Driver Info */}
        {currentRide.driver && (
          <View style={styles.driverSection}>
            <View style={styles.driverInfo}>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{currentRide.driver.name}</Text>
                <Text style={styles.driverRating}>
                  ⭐ {currentRide.driver.rating.toFixed(1)}
                </Text>
              </View>
              
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleText}>
                  {currentRide.driver.vehicle.color} {currentRide.driver.vehicle.make} {currentRide.driver.vehicle.model}
                </Text>
                <Text style={styles.plateNumber}>
                  {currentRide.driver.vehicle.plateNumber}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={handleCallDriver}
            >
              <Text style={styles.callButtonText}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Trip Details */}
        <View style={styles.tripDetails}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Pickup</Text>
              <Text style={styles.locationAddress}>{currentRide.pickup.address}</Text>
            </View>
          </View>

          <View style={styles.locationDivider} />

          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>🎯</Text>
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Destination</Text>
              <Text style={styles.locationAddress}>{currentRide.destination.address}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {canCancelRide && (
            <Button
              title="Cancel Ride"
              onPress={handleCancelRide}
              disabled={loading}
              style={{
                ...styles.actionButton,
                backgroundColor: colors.error[500],
              }}
              textStyle={styles.cancelButtonText}
            />
          )}

          {currentRide.status === 'completed' && (
            <Button
              title="Book Another Ride"
              onPress={() => navigation.navigate('RideBooking')}
              style={{
                ...styles.actionButton,
                backgroundColor: colors.primary[500],
              }}
            />
          )}
        </View>

        {/* Ride Timeline */}
        {currentRide.timeline && currentRide.timeline.length > 0 && (
          <View style={styles.timelineSection}>
            <Text style={styles.timelineTitle}>Ride Timeline</Text>
            {currentRide.timeline.slice(-3).map((event, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>
                    {event.status.replace('_', ' ').toUpperCase()}
                  </Text>
                  {event.notes && (
                    <Text style={styles.timelineNotes}>{event.notes}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  statusCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    maxHeight: height * 0.6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  statusText: {
    ...textStyles.body1,
    color: colors.gray[700],
    fontWeight: '600',
    flex: 1,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  driverInfo: {
    flex: 1,
  },
  driverDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  driverName: {
    ...textStyles.h4,
    color: colors.gray[900],
    marginRight: spacing.sm,
  },
  driverRating: {
    ...textStyles.body2,
    color: colors.gray[600],
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    ...textStyles.body2,
    color: colors.gray[700],
    marginRight: spacing.sm,
  },
  plateNumber: {
    ...textStyles.body2,
    color: colors.gray[900],
    fontWeight: '600',
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
  },
  callButton: {
    backgroundColor: colors.success[500],
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: 20,
  },
  tripDetails: {
    marginBottom: spacing.lg,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
    marginTop: 2,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    ...textStyles.caption,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  locationAddress: {
    ...textStyles.body2,
    color: colors.gray[900],
  },
  locationDivider: {
    width: 2,
    height: 20,
    backgroundColor: colors.gray[300],
    marginLeft: 8,
    marginVertical: spacing.xs,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  cancelButtonText: {
    color: colors.white,
  },
  timelineSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.md,
  },
  timelineTitle: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
    marginRight: spacing.sm,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStatus: {
    ...textStyles.caption,
    fontWeight: '600',
    color: colors.gray[700],
  },
  timelineNotes: {
    ...textStyles.caption,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
});

export default EnhancedRideTrackingScreen;
