// Full-screen ride booking with map and autocomplete
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import RideMapView from '../../components/ride/MapView';
import { GooglePlacesAutocomplete } from '../../components/ride/GooglePlacesAutocomplete';
import { useAppDispatch, useAppSelector } from '../../store';
import { locationService } from '../../services/locationService';
import { colors, textStyles, spacing } from '../../theme';

const { width, height } = Dimensions.get('window');

interface RideBookingScreenProps {
  navigation: any;
}

export const RideBookingScreen: React.FC<RideBookingScreenProps> = ({ navigation }) => {
  const [pickupAddress, setPickupAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 31.9454,
    longitude: 35.9284,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [pickupLocation, setPickupLocation] = useState<{lat: number; lng: number} | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<{lat: number; lng: number} | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  // Get current location on component mount
  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setMapLoading(true);
      
      // Check and request location permission
      const hasPermission = await locationService.requestLocationPermission();
      setHasLocationPermission(hasPermission);
      
      if (hasPermission) {
        await getCurrentLocation();
      } else {
        // Set default location even without permission
        console.log('Location permission not granted, using default location');
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    } finally {
      // Always set loading to false after 2 seconds max
      setTimeout(() => {
        setMapLoading(false);
      }, 100);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      setMapRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.log('Could not get current location:', error);
      // Use default location (Amman, Jordan) if permission denied
      setMapRegion({
        latitude: 31.9454,
        longitude: 35.9284,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  };


  const selectPickupPlace = async (place: any) => {
    try {
      const details = await locationService.getPlaceDetails(place.place_id);
      if (details && details.geometry) {
        const location = {
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
        };
        setPickupLocation(location);
        
        // Update map region to show the selected location
        setMapRegion({
          latitude: location.lat,
          longitude: location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      console.log('Error getting place details:', error);
    }
  };

  const selectDestinationPlace = async (place: any) => {
    try {
      const details = await locationService.getPlaceDetails(place.place_id);
      if (details && details.geometry) {
        const location = {
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
        };
        setDestinationLocation(location);
        
        // If both pickup and destination are set, fit map to show both
        if (pickupLocation) {
          // Calculate region that includes both points
          const minLat = Math.min(pickupLocation.lat, location.lat);
          const maxLat = Math.max(pickupLocation.lat, location.lat);
          const minLng = Math.min(pickupLocation.lng, location.lng);
          const maxLng = Math.max(pickupLocation.lng, location.lng);
          
          const latDelta = (maxLat - minLat) * 1.5; // Add padding
          const lngDelta = (maxLng - minLng) * 1.5;
          
          setMapRegion({
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(latDelta, 0.01),
            longitudeDelta: Math.max(lngDelta, 0.01),
          });
        }
      }
    } catch (error) {
      console.log('Error getting place details:', error);
    }
  };

  const handleBookRide = async () => {
    if (!pickupAddress.trim()) {
      Alert.alert('Error', 'Please enter a pickup location');
      return;
    }

    if (!destinationAddress.trim()) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    setLoading(true);

    try {
      // Simulate booking process
      await new Promise<void>(resolve => setTimeout(() => resolve(), 2000));
      
      Alert.alert(
        'Ride Booked!',
        `Your ride from "${pickupAddress}" to "${destinationAddress}" has been requested. Looking for nearby drivers...`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      // You could reverse geocode here to get address
      setPickupAddress('Current Location');
      setPickupLocation({ lat: location.lat, lng: location.lng });
      setMapRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get current location. Please enter manually.');
    }
  };

  const getMapMarkers = () => {
    const markers: any[] = [];
    if (pickupLocation) {
      markers.push({
        id: 'pickup',
        coordinate: { latitude: pickupLocation.lat, longitude: pickupLocation.lng },
        type: 'pickup',
        title: 'Pickup Location',
        description: pickupAddress,
      });
    }
    if (destinationLocation) {
      markers.push({
        id: 'destination',
        coordinate: { latitude: destinationLocation.lat, longitude: destinationLocation.lng },
        type: 'destination',
        title: 'Destination',
        description: destinationAddress,
      });
    }
    return markers;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Indicator */}
      {mapLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}

      {/* Full Screen Map */}
      {!mapLoading && (
        <RideMapView
          region={mapRegion}
          markers={getMapMarkers()}
          pickup={pickupLocation ? {
            address: pickupAddress,
            coordinates: pickupLocation,
          } : undefined}
          destination={destinationLocation ? {
            address: destinationAddress,
            coordinates: destinationLocation,
          } : undefined}
          showRoute={pickupLocation && destinationLocation ? true : false}
          onRegionChange={setMapRegion}
          style={styles.map}
        />
      )}

      {/* Location Input Panel */}
      {!mapLoading && (
        <View style={styles.inputPanel}>
          {/* Pickup Input */}
          <GooglePlacesAutocomplete
            placeholder="Enter pickup location"
            value={pickupAddress}
            onChangeText={setPickupAddress}
            onPlaceSelected={selectPickupPlace}
            leftIcon={<View style={styles.locationDot} />}
            rightIcon={<Text style={styles.currentLocationText}>📍</Text>}
            onRightIconPress={handleUseCurrentLocation}
            containerStyle={styles.autocompleteContainer}
          />

          {/* Destination Input */}
          <GooglePlacesAutocomplete
            placeholder="Enter destination"
            value={destinationAddress}
            onChangeText={setDestinationAddress}
            onPlaceSelected={selectDestinationPlace}
            leftIcon={<View style={[styles.locationDot, { backgroundColor: colors.error[500] }]} />}
            containerStyle={[styles.autocompleteContainer, { marginTop: spacing.sm }]}
          />
        </View>
      )}

      {/* Book Ride Button */}
      {!mapLoading && (
        <View style={styles.bottomPanel}>
          <Button
            title={loading ? "Booking Ride..." : "Book Ride"}
            onPress={handleBookRide}
            disabled={loading || !pickupAddress.trim() || !destinationAddress.trim()}
            style={styles.bookButton}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  map: {
    flex: 1,
    width: width,
    height: height,
  },
  inputPanel: {
    position: 'absolute',
    top: 60,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success[500],
    marginRight: spacing.md,
  },
  currentLocationText: {
    fontSize: 18,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 40,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButton: {
    backgroundColor: colors.primary[500],
  },
  autocompleteContainer: {
    zIndex: 1000,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    zIndex: 9999,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: '500',
  },
});
