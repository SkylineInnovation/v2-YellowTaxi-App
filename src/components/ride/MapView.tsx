// MapView component with Google Maps integration
import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapRegion, MapMarker, Location, DriverInfo } from '../../types/ride';
import { colors } from '../../theme';
import { locationService } from '../../services/locationService';

interface RideMapViewProps {
  region: MapRegion;
  markers: MapMarker[];
  pickup?: Location;
  destination?: Location;
  driverLocation?: DriverInfo;
  showRoute?: boolean;
  onRegionChange?: (region: MapRegion) => void;
  onMarkerPress?: (marker: MapMarker) => void;
  style?: any;
}

export const RideMapView: React.FC<RideMapViewProps> = ({
  region,
  markers,
  pickup,
  destination,
  driverLocation,
  showRoute = false,
  onRegionChange,
  onMarkerPress,
  style,
}) => {
  const mapRef = useRef<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);

  // Fetch route when pickup and destination are available
  useEffect(() => {
    if (showRoute && pickup && destination) {
      fetchRoute();
    }
  }, [pickup, destination, showRoute]);

  const fetchRoute = async () => {
    try {
      const directions = await locationService.getDirections(
        pickup!.coordinates,
        destination!.coordinates
      );

      if (directions?.polyline) {
        // Decode polyline to coordinates
        const coordinates = decodePolyline(directions.polyline);
        setRouteCoordinates(coordinates);
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Simple polyline decoder (you might want to use a library like @mapbox/polyline)
  const decodePolyline = (encoded: string): { latitude: number; longitude: number }[] => {
    // This is a simplified decoder - in production, use a proper polyline decoder
    // For now, return a straight line between pickup and destination
    if (pickup && destination) {
      return [
        { latitude: pickup.coordinates.lat, longitude: pickup.coordinates.lng },
        { latitude: destination.coordinates.lat, longitude: destination.coordinates.lng },
      ];
    }
    return [];
  };

  const fitToMarkers = () => {
    if (mapRef.current && markers.length > 0) {
      const coordinates = markers.map(marker => marker.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  };

  const getMarkerColor = (type: string): string => {
    switch (type) {
      case 'pickup':
        return colors.success[500];
      case 'destination':
        return colors.error[500];
      case 'driver':
        return colors.primary[500];
      case 'user':
        return colors.info[500];
      default:
        return colors.gray[500];
    }
  };

  const getMarkerTitle = (marker: MapMarker): string => {
    switch (marker.type) {
      case 'pickup':
        return 'Pickup Location';
      case 'destination':
        return 'Destination';
      case 'driver':
        return 'Driver';
      case 'user':
        return 'Your Location';
      default:
        return marker.title || 'Location';
    }
  };

  // Initialize map region when component mounts
  useEffect(() => {
    if (mapRef.current && markers.length > 1) {
      // Fit to markers after a short delay to ensure map is ready
      setTimeout(() => {
        fitToMarkers();
      }, 1000);
    }
  }, [markers]);

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={false} // Disable to avoid permission issues
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={false}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary[500]}
        loadingBackgroundColor={colors.white}
        zoomEnabled={true}
        scrollEnabled={true}
        pitchEnabled={true}
        rotateEnabled={true}
        cacheEnabled={true}
        moveOnMarkerPress={false}
        showsPointsOfInterests={true}
        showsBuildings={true}
        showsTraffic={false}
      >
        {/* Regular markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={marker.coordinate}
            title={getMarkerTitle(marker)}
            description={marker.description}
            pinColor={getMarkerColor(marker.type)}
            onPress={() => onMarkerPress?.(marker)}
          />
        ))}

        {/* Pickup marker */}
        {pickup && (
          <Marker
            coordinate={{
              latitude: pickup.coordinates.lat,
              longitude: pickup.coordinates.lng,
            }}
            title="Pickup Location"
            description={pickup.address}
            pinColor={colors.success[500]}
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.coordinates.lat,
              longitude: destination.coordinates.lng,
            }}
            title="Destination"
            description={destination.address}
            pinColor={colors.error[500]}
          />
        )}

        {/* Driver marker */}
        {driverLocation && (
          <Marker
            coordinate={{
              latitude: driverLocation.location.lat,
              longitude: driverLocation.location.lng,
            }}
            title={driverLocation.name}
            description={`${driverLocation.vehicle.make} ${driverLocation.vehicle.model} - ${driverLocation.vehicle.plateNumber}`}
            pinColor={colors.primary[500]}
            rotation={driverLocation.bearing}
          />
        )}

        {/* Route polyline */}
        {showRoute && routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={colors.primary[500]}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
  },
  fallbackText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray[700],
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    color: colors.gray[500],
    textAlign: 'center',
  },
});

export default RideMapView;
