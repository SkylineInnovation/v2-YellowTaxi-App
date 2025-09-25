// Enhanced ride booking screen with Google Maps and real-time features
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import { LocationInput } from '../../components/ride/LocationInput';
import { ServiceTypeSelector } from '../../components/ride/ServiceTypeSelector';
import { PaymentMethodSelector } from '../../components/ride/PaymentMethodSelector';
import RideMapView from '../../components/ride/MapView';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  createRideRequest,
  fetchRideEstimates,
  selectRideLoading,
  selectRideError,
  selectRideEstimates,
  selectCanBookRide,
  clearError,
} from '../../store/slices/rideSlice';
import { Location, ServiceType, PaymentMethod, MapRegion, MapMarker } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';
import { locationService } from '../../services/locationService';

const { width, height } = Dimensions.get('window');

interface EnhancedRideBookingScreenProps {
  navigation: any;
}

export const EnhancedRideBookingScreen: React.FC<EnhancedRideBookingScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const loading = useAppSelector(selectRideLoading);
  const error = useAppSelector(selectRideError);
  const rideEstimates = useAppSelector(selectRideEstimates);
  const canBookRide = useAppSelector(selectCanBookRide);

  const [pickup, setPickup] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [serviceType, setServiceType] = useState<ServiceType>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [showMap, setShowMap] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<MapRegion>({
    latitude: 31.9454, // Default to Amman, Jordan
    longitude: 35.9284,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const scrollViewRef = useRef<ScrollView>(null);

  // Get user's current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, []);

  // Fetch ride estimates when pickup and destination are set
  useEffect(() => {
    if (pickup && destination) {
      dispatch(fetchRideEstimates({ pickup, destination }));
      updateMapRegion();
    }
  }, [pickup, destination, dispatch]);

  // Show error alerts
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setUserLocation(location);
      setMapRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const updateMapRegion = () => {
    if (pickup && destination) {
      const region = locationService.calculateMapRegion([
        pickup.coordinates,
        destination.coordinates,
      ]);
      setMapRegion(region);
    } else if (pickup) {
      setMapRegion({
        latitude: pickup.coordinates.lat,
        longitude: pickup.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (destination) {
      setMapRegion({
        latitude: destination.coordinates.lat,
        longitude: destination.coordinates.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
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

    if (pickup) {
      markers.push({
        id: 'pickup',
        coordinate: {
          latitude: pickup.coordinates.lat,
          longitude: pickup.coordinates.lng,
        },
        title: 'Pickup Location',
        description: pickup.address,
        type: 'pickup',
      });
    }

    if (destination) {
      markers.push({
        id: 'destination',
        coordinate: {
          latitude: destination.coordinates.lat,
          longitude: destination.coordinates.lng,
        },
        title: 'Destination',
        description: destination.address,
        type: 'destination',
      });
    }

    return markers;
  };

  const handleBookRide = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'Please log in to book a ride');
      return;
    }

    if (!pickup || !destination) {
      Alert.alert('Error', 'Please select both pickup and destination locations');
      return;
    }

    try {
      await dispatch(createRideRequest({
        customerId: user.id,
        pickup,
        destination,
        serviceType,
        paymentMethod,
        notes: notes.trim() || undefined,
      })).unwrap();

      // Navigate to enhanced ride tracking screen
      navigation.navigate('EnhancedRideTracking');
    } catch (error) {
      // Error is handled by the effect above
      console.error('Failed to book ride:', error);
    }
  };

  const getEstimatedPrice = () => {
    const estimate = rideEstimates.find(e => e.serviceType === serviceType);
    return estimate?.pricing.total;
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      const address = `Current Location (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`;
      
      const currentLocationObj: Location = {
        address,
        coordinates: location,
      };

      if (!pickup) {
        setPickup(currentLocationObj);
      } else if (!destination) {
        setDestination(currentLocationObj);
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get your current location');
    }
  };

  const toggleMapView = () => {
    setShowMap(!showMap);
  };

  const isFormValid = pickup && destination && canBookRide;

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Map View */}
        {showMap && (
          <View style={styles.mapContainer}>
            <RideMapView
              region={mapRegion}
              markers={getMapMarkers()}
              pickup={pickup || undefined}
              destination={destination || undefined}
              showRoute={pickup && destination ? true : false}
              onRegionChange={setMapRegion}
              style={styles.map}
            />
            
            {/* Map Controls */}
            <View style={styles.mapControls}>
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={handleUseCurrentLocation}
              >
                <Text style={styles.mapControlText}>📍</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={toggleMapView}
              >
                <Text style={styles.mapControlText}>📋</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Form Content */}
        <ScrollView
          ref={scrollViewRef}
          style={[styles.scrollView, showMap ? styles.scrollViewWithMap : styles.scrollViewFullScreen]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Book Your Ride</Text>
              <Text style={styles.subtitle}>
                Choose your pickup and destination
              </Text>
            </View>
            
            {!showMap && (
              <TouchableOpacity
                style={styles.showMapButton}
                onPress={toggleMapView}
              >
                <Text style={styles.showMapText}>🗺️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Location Inputs */}
          <View style={styles.locationSection}>
            <View style={styles.locationInputContainer}>
              <View style={styles.locationDot} />
              <LocationInput
                placeholder="Pickup location"
                value={pickup}
                onChange={setPickup}
                icon={<Text style={styles.locationIcon}>📍</Text>}
              />
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationInputContainer}>
              <View style={[styles.locationDot, styles.destinationDot]} />
              <LocationInput
                placeholder="Where to?"
                value={destination}
                onChange={setDestination}
                icon={<Text style={styles.locationIcon}>🎯</Text>}
              />
            </View>

            {/* Quick Location Button */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleUseCurrentLocation}
            >
              <Text style={styles.currentLocationText}>Use Current Location</Text>
            </TouchableOpacity>
          </View>

          {/* Service Type Selection */}
          {pickup && destination && (
            <View style={styles.sectionContainer}>
              <ServiceTypeSelector
                selectedType={serviceType}
                onSelect={setServiceType}
                estimatedPrice={getEstimatedPrice()}
              />
            </View>
          )}

          {/* Payment Method Selection */}
          {pickup && destination && (
            <View style={styles.sectionContainer}>
              <PaymentMethodSelector
                selectedMethod={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </View>
          )}

          {/* Ride Summary */}
          {pickup && destination && (
            <View style={styles.summarySection}>
              <Text style={styles.summaryTitle}>Ride Summary</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>From:</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {pickup.address}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>To:</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {destination.address}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Service:</Text>
                  <Text style={styles.summaryValue}>{serviceType}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Payment:</Text>
                  <Text style={styles.summaryValue}>{paymentMethod}</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Book Ride Button */}
        <View style={styles.bottomSection}>
          <Button
            title={loading ? 'Booking...' : 'Book Ride'}
            onPress={handleBookRide}
            disabled={!isFormValid || loading}
            loading={loading}
            style={styles.bookButton}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mapContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'column',
  },
  mapControlButton: {
    backgroundColor: colors.white,
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapControlText: {
    fontSize: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewWithMap: {
    maxHeight: height * 0.6,
  },
  scrollViewFullScreen: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    ...textStyles.h2,
    color: colors.gray[900],
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...textStyles.body1,
    color: colors.gray[600],
  },
  showMapButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  showMapText: {
    fontSize: 20,
  },
  sectionContainer: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  locationSection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  locationIcon: {
    fontSize: 16,
  },
  currentLocationButton: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  currentLocationText: {
    ...textStyles.body2,
    color: colors.primary[600],
    fontWeight: '600',
  },
  summarySection: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  summaryTitle: {
    ...textStyles.h3,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  summaryLabel: {
    ...textStyles.body1,
    color: colors.gray[600],
    flex: 1,
  },
  summaryValue: {
    ...textStyles.body1,
    color: colors.gray[900],
    flex: 2,
    textAlign: 'right',
    textTransform: 'capitalize',
  },
  bottomSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  bookButton: {
    backgroundColor: colors.primary[500],
  },
});

export default EnhancedRideBookingScreen;
