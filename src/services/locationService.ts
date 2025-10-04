// Location service for Google Maps integration and real-time tracking
import * as ExpoLocation from 'expo-location';
import { Platform, Alert } from 'react-native';
import { firebaseFirestore, FieldValue } from '../config/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Location, LocationUpdate, MapRegion } from '../types/ride';

export interface GooglePlacesResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export interface GooglePlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
  types: string[];
}

class LocationService {
  private static instance: LocationService;
  private watchId: ExpoLocation.LocationSubscription | null = null;
  private googleApiKey: string = 'AIzaSyDyfbLegHVXSwjhSvKeC3aYjwhV5mOifqw'; // Google Places API key
  private locationUpdateCallbacks: ((location: LocationUpdate) => void)[] = [];

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  // Check if location permissions are already granted
  async hasLocationPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking location permission:', error);
      return false;
    }
  }

  // Request location permissions
  async requestLocationPermission(): Promise<boolean> {
    try {
      // First check if we already have permission
      const hasPermission = await this.hasLocationPermission();
      if (hasPermission) {
        return true;
      }

      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Get current location
  async getCurrentLocation(): Promise<{ lat: number; lng: number; bearing?: number }> {
    try {
      // First request permission
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission not granted');
      }

      const position = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      
      return {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        bearing: position.coords.heading || undefined,
      };
    } catch (error) {
      console.error('getCurrentLocation failed:', error);
      // Provide fallback for development
      if (__DEV__) {
        console.warn('Using fallback location due to error');
        return {
          lat: 31.9454,
          lng: 35.9284,
          bearing: undefined,
        };
      }
      throw error;
    }
  }

  // Start watching location changes
  async startLocationTracking(
    userId: string,
    userType: 'customer' | 'driver',
    rideId?: string
  ): Promise<void> {
    try {
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      this.watchId = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          distanceInterval: 10, // Update every 10 meters
          timeInterval: 5000, // Update every 5 seconds
        },
        (position: ExpoLocation.LocationObject) => {
          const locationUpdate: LocationUpdate = {
            userId,
            userType,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              bearing: position.coords.heading || undefined,
              speed: position.coords.speed || undefined,
              accuracy: position.coords.accuracy || undefined,
            },
            timestamp: FieldValue.serverTimestamp() as any,
            rideId,
          };

          // Update location in Firestore
          this.updateLocationInFirestore(locationUpdate);

          // Notify callbacks
          this.locationUpdateCallbacks.forEach(callback => callback(locationUpdate));
        }
      );
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }

  // Stop location tracking
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      this.watchId.remove();
      this.watchId = null;
    }
  }

  // Update location in Firestore
  private async updateLocationInFirestore(locationUpdate: LocationUpdate): Promise<void> {
    try {
      await addDoc(
        collection(firebaseFirestore, 'location_updates'),
        locationUpdate
      );

      // Also update user's current location
      const userCollection = locationUpdate.userType === 'driver' ? 'drivers' : 'users';
      const userDocRef = doc(firebaseFirestore, userCollection, locationUpdate.userId);
      await updateDoc(userDocRef, {
        location: locationUpdate.location,
        lastLocationUpdate: locationUpdate.timestamp,
      });
    } catch (error) {
      console.error('Error updating location in Firestore:', error);
    }
  }

  // Subscribe to location updates
  onLocationUpdate(callback: (location: LocationUpdate) => void): () => void {
    this.locationUpdateCallbacks.push(callback);
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  // Google Places Autocomplete
  async searchPlaces(query: string, location?: { lat: number; lng: number }): Promise<GooglePlacesResult[]> {
    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${this.googleApiKey}&types=establishment|geocode`;
      
      if (location) {
        url += `&location=${location.lat},${location.lng}&radius=50000`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.predictions;
      } else {
        console.error('Google Places API error:', data.status);
        return [];
      }
    } catch (error) {
      console.error('Error searching places:', error);
      return [];
    }
  }

  // Get place details by place ID
  async getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${this.googleApiKey}&fields=place_id,formatted_address,geometry,name,types`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        return data.result;
      } else {
        console.error('Google Place Details API error:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }

  // Convert Google Place to Location object
  async convertPlaceToLocation(place: GooglePlacesResult): Promise<Location | null> {
    try {
      let coordinates = place.geometry?.location;
      
      if (!coordinates) {
        const details = await this.getPlaceDetails(place.place_id);
        if (!details) return null;
        coordinates = details.geometry.location;
      }

      return {
        address: place.description,
        coordinates: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        placeId: place.place_id,
      };
    } catch (error) {
      console.error('Error converting place to location:', error);
      return null;
    }
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(
    point1: { lat: number; lng: number },
    point2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate map region for given locations
  calculateMapRegion(locations: { lat: number; lng: number }[], padding: number = 0.01): MapRegion {
    if (locations.length === 0) {
      return {
        latitude: 31.9454, // Default to Amman, Jordan
        longitude: 35.9284,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    if (locations.length === 1) {
      return {
        latitude: locations[0].lat,
        longitude: locations[0].lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
    }

    const minLat = Math.min(...locations.map(l => l.lat));
    const maxLat = Math.max(...locations.map(l => l.lat));
    const minLng = Math.min(...locations.map(l => l.lng));
    const maxLng = Math.max(...locations.map(l => l.lng));

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = (maxLat - minLat) + padding;
    const lngDelta = (maxLng - minLng) + padding;

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(latDelta, 0.01),
      longitudeDelta: Math.max(lngDelta, 0.01),
    };
  }

  // Get directions between two points
  async getDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<{
    distance: number;
    duration: number;
    polyline: string;
  } | null> {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${this.googleApiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance.value / 1000, // Convert to kilometers
          duration: leg.duration.value / 60, // Convert to minutes
          polyline: route.overview_polyline.points,
        };
      } else {
        console.error('Google Directions API error:', data.status);
        return null;
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      return null;
    }
  }
}

export const locationService = LocationService.getInstance();
