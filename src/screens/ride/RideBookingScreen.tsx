import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Screen, Button } from '../../components/ui';
import { LocationInput } from '../../components/ride/LocationInput';
import { ServiceTypeSelector } from '../../components/ride/ServiceTypeSelector';
import { PaymentMethodSelector } from '../../components/ride/PaymentMethodSelector';
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
import { Location, ServiceType, PaymentMethod } from '../../types/ride';
import { colors, textStyles, spacing } from '../../theme';

interface RideBookingScreenProps {
  navigation: any;
}

export const RideBookingScreen: React.FC<RideBookingScreenProps> = ({ navigation }) => {
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

      // Navigate to ride tracking screen
      navigation.navigate('RideTracking');
    } catch (error) {
      // Error is handled by the effect above
      console.error('Failed to book ride:', error);
    }
  };

  const getEstimatedPrice = () => {
    const estimate = rideEstimates.find(e => e.serviceType === serviceType);
    return estimate?.pricing.total;
  };

  const isFormValid = pickup && destination && canBookRide;

  return (
    <Screen style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Book Your Ride</Text>
            <Text style={styles.subtitle}>
              Choose your pickup and destination to get started
            </Text>
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
                {getEstimatedPrice() && (
                  <View style={[styles.summaryRow, styles.priceRow]}>
                    <Text style={styles.priceLabel}>Estimated Total:</Text>
                    <Text style={styles.priceValue}>
                      {getEstimatedPrice()?.toFixed(2)} JOD
                    </Text>
                  </View>
                )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
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
  priceRow: {
    borderBottomWidth: 0,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 2,
    borderTopColor: colors.primary[200],
  },
  priceLabel: {
    ...textStyles.body1,
    fontWeight: '600',
    color: colors.gray[900],
  },
  priceValue: {
    ...textStyles.h4,
    fontWeight: 'bold',
    color: colors.primary[600],
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
