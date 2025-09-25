import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Linking } from 'react-native';
import { Button } from '../ui';
import { locationService } from '../../services/locationService';
import { colors, textStyles, spacing } from '../../theme';

interface LocationPermissionHandlerProps {
  children: React.ReactNode;
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
}

export const LocationPermissionHandler: React.FC<LocationPermissionHandlerProps> = ({
  children,
  onPermissionGranted,
  onPermissionDenied,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const permission = await locationService.hasLocationPermission();
      setHasPermission(permission);
      
      if (permission) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setHasPermission(false);
      onPermissionDenied?.();
    }
  };

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await locationService.requestLocationPermission();
      setHasPermission(granted);
      
      if (granted) {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
        showPermissionDeniedAlert();
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setHasPermission(false);
      onPermissionDenied?.();
      showPermissionDeniedAlert();
    } finally {
      setIsRequesting(false);
    }
  };

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      'Location Permission Required',
      'YellowTaxi needs location access to provide ride services. Please enable location permissions in your device settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
        {
          text: 'Try Again',
          onPress: requestLocationPermission,
        },
      ]
    );
  };

  // Show loading state while checking permission
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Checking location permissions...</Text>
      </View>
    );
  }

  // Show permission request UI if permission is denied
  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionCard}>
          <Text style={styles.title}>Location Permission Required</Text>
          <Text style={styles.description}>
            YellowTaxi needs access to your location to:
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Find nearby drivers</Text>
            <Text style={styles.featureItem}>• Show your pickup location</Text>
            <Text style={styles.featureItem}>• Track your ride in real-time</Text>
            <Text style={styles.featureItem}>• Provide accurate navigation</Text>
          </View>
          <Button
            title={isRequesting ? "Requesting Permission..." : "Grant Location Permission"}
            onPress={requestLocationPermission}
            disabled={isRequesting}
            style={styles.permissionButton}
          />
          <Text style={styles.note}>
            Your location data is only used for ride services and is never shared with third parties.
          </Text>
        </View>
      </View>
    );
  }

  // Render children if permission is granted
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    padding: spacing.lg,
  },
  loadingText: {
    ...textStyles.body1,
    color: colors.gray[600],
  },
  permissionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 350,
  },
  title: {
    ...textStyles.h3,
    color: colors.gray[900],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...textStyles.body1,
    color: colors.gray[700],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  featureList: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  featureItem: {
    ...textStyles.body2,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  permissionButton: {
    marginBottom: spacing.md,
    minWidth: 200,
  },
  note: {
    ...textStyles.caption,
    color: colors.gray[500],
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default LocationPermissionHandler;
