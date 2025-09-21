// Ride service for React Native mobile app
import {
  firebaseFirestore,
  FieldValue,
  isFirebaseConfigured,
} from '../config/firebase';
import {
  RideRequest,
  RideOrder,
  CreateRideRequestData,
  UpdateRideStatusData,
  Location,
  ServiceType,
  PaymentMethod,
  RidePricing,
  NearbyDriver,
  RideEstimate,
} from '../types/ride';

class RideService {
  private static instance: RideService;
  private readonly RIDE_REQUESTS_COLLECTION = 'rideRequests';
  private readonly ORDERS_COLLECTION = 'orders';
  private readonly DRIVERS_COLLECTION = 'drivers';
  private readonly USERS_COLLECTION = 'users';

  static getInstance(): RideService {
    if (!RideService.instance) {
      RideService.instance = new RideService();
    }
    return RideService.instance;
  }

  // Calculate distance between two coordinates (Haversine formula)
  private calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.lat - coord1.lat);
    const dLng = this.toRadians(coord2.lng - coord1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.lat)) *
        Math.cos(this.toRadians(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Calculate pricing based on distance and service type
  private calculatePricing(distance: number, serviceType: ServiceType): RidePricing {
    const baseFares = {
      economy: 1.5,
      standard: 2.0,
      premium: 3.0,
    };

    const pricePerKm = {
      economy: 0.5,
      standard: 0.7,
      premium: 1.0,
    };

    const baseFare = baseFares[serviceType];
    const distanceFare = distance * pricePerKm[serviceType];
    const timeFare = 0; // Can be calculated based on estimated time
    const surcharge = 0; // Can be added for peak hours, etc.
    const discount = 0; // Can be applied based on promotions

    const total = baseFare + distanceFare + timeFare + surcharge - discount;

    return {
      baseFare,
      distanceFare,
      timeFare,
      surcharge,
      discount,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      currency: 'JOD',
      estimatedDistance: distance,
      estimatedDuration: Math.ceil(distance * 2), // Rough estimate: 2 minutes per km
    };
  }

  // Create a new ride request
  async createRideRequest(requestData: CreateRideRequestData): Promise<string> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured');
      }

      // Get customer information
      const customerDoc = await firebaseFirestore
        .collection(this.USERS_COLLECTION)
        .doc(requestData.customerId)
        .get();

      if (!customerDoc.exists) {
        throw new Error('Customer not found');
      }

      const customer = customerDoc.data();
      const now = FieldValue.serverTimestamp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Calculate pricing
      const distance = this.calculateDistance(
        requestData.pickup.coordinates,
        requestData.destination.coordinates
      );
      const pricing = this.calculatePricing(distance, requestData.serviceType);

      const rideRequest: Omit<RideRequest, 'id'> = {
        customerId: requestData.customerId,
        pickup: requestData.pickup,
        destination: requestData.destination,
        serviceType: requestData.serviceType,
        paymentMethod: requestData.paymentMethod,
        notes: requestData.notes,
        status: 'pending',
        pricing,
        createdAt: now as any,
        expiresAt: FieldValue.serverTimestamp() as any,
      };

      // Create the ride request document
      const docRef = await firebaseFirestore
        .collection(this.RIDE_REQUESTS_COLLECTION)
        .add(rideRequest);

      // Update with the document ID and expiration time
      await docRef.update({
        id: docRef.id,
        expiresAt: FieldValue.serverTimestamp(),
      });

      console.log('Ride request created:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error creating ride request:', error);
      throw error;
    }
  }

  // Get ride request by ID
  async getRideRequest(requestId: string): Promise<RideRequest | null> {
    try {
      const doc = await firebaseFirestore
        .collection(this.RIDE_REQUESTS_COLLECTION)
        .doc(requestId)
        .get();

      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as RideRequest;
    } catch (error) {
      console.error('Error getting ride request:', error);
      throw error;
    }
  }

  // Cancel a ride request
  async cancelRideRequest(requestId: string, reason?: string): Promise<void> {
    try {
      await firebaseFirestore
        .collection(this.RIDE_REQUESTS_COLLECTION)
        .doc(requestId)
        .update({
          status: 'cancelled',
          updatedAt: FieldValue.serverTimestamp(),
          cancellationReason: reason,
        });

      console.log('Ride request cancelled:', requestId);
    } catch (error) {
      console.error('Error cancelling ride request:', error);
      throw error;
    }
  }

  // Subscribe to customer's ride requests
  subscribeToCustomerRideRequests(
    customerId: string,
    callback: (requests: RideRequest[]) => void
  ): () => void {
    const unsubscribe = firebaseFirestore
      .collection(this.RIDE_REQUESTS_COLLECTION)
      .where('customerId', '==', customerId)
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const requests: RideRequest[] = [];
          snapshot.forEach((doc) => {
            requests.push({ id: doc.id, ...doc.data() } as RideRequest);
          });
          callback(requests);
        },
        (error) => {
          console.error('Error subscribing to ride requests:', error);
        }
      );

    return unsubscribe;
  }

  // Subscribe to customer's ride orders
  subscribeToCustomerRideOrders(
    customerId: string,
    callback: (orders: RideOrder[]) => void
  ): () => void {
    const unsubscribe = firebaseFirestore
      .collection(this.ORDERS_COLLECTION)
      .where('customer.id', '==', customerId)
      .orderBy('metadata.createdAt', 'desc')
      .onSnapshot(
        (snapshot) => {
          const orders: RideOrder[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            // Transform Firestore document to RideOrder format
            const order: RideOrder = {
              id: doc.id,
              customerId: data.customer.id,
              driverId: data.driver?.id,
              pickup: {
                address: data.locations.pickup.address,
                coordinates: {
                  lat: data.locations.pickup.coordinates.latitude,
                  lng: data.locations.pickup.coordinates.longitude,
                },
                placeId: data.locations.pickup.placeId,
              },
              destination: {
                address: data.locations.destination.address,
                coordinates: {
                  lat: data.locations.destination.coordinates.latitude,
                  lng: data.locations.destination.coordinates.longitude,
                },
                placeId: data.locations.destination.placeId,
              },
              serviceType: data.service.type,
              paymentMethod: data.payment.method,
              status: data.status.current,
              pricing: data.pricing,
              driver: data.driver ? {
                id: data.driver.id,
                name: data.driver.name,
                phone: data.driver.phone,
                avatar: data.driver.avatar,
                rating: data.driver.rating || 5.0,
                vehicle: data.driver.vehicle,
                location: {
                  lat: data.driver.location.latitude,
                  lng: data.driver.location.longitude,
                },
                bearing: data.driver.bearing,
              } : undefined,
              timeline: data.status.timeline || [],
              createdAt: data.metadata.createdAt,
              updatedAt: data.metadata.updatedAt,
              completedAt: data.metadata.completedAt,
              notes: data.notes,
            };
            orders.push(order);
          });
          callback(orders);
        },
        (error) => {
          console.error('Error subscribing to ride orders:', error);
        }
      );

    return unsubscribe;
  }

  // Get nearby drivers (mock implementation for now)
  async getNearbyDrivers(location: Location, radius: number = 5): Promise<NearbyDriver[]> {
    try {
      // In a real implementation, this would query drivers within a certain radius
      // For now, return mock data
      const mockDrivers: NearbyDriver[] = [
        {
          id: 'driver1',
          name: 'Ahmed Ali',
          location: {
            lat: location.coordinates.lat + 0.001,
            lng: location.coordinates.lng + 0.001,
          },
          bearing: 45,
          distance: 0.5,
          estimatedArrival: 3,
          rating: 4.8,
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            plateNumber: 'ABC-123',
          },
          isOnline: true,
          isAvailable: true,
        },
        {
          id: 'driver2',
          name: 'Mohammad Hassan',
          location: {
            lat: location.coordinates.lat - 0.002,
            lng: location.coordinates.lng + 0.003,
          },
          bearing: 180,
          distance: 1.2,
          estimatedArrival: 5,
          rating: 4.9,
          vehicle: {
            make: 'Hyundai',
            model: 'Elantra',
            year: 2019,
            color: 'Black',
            plateNumber: 'XYZ-789',
          },
          isOnline: true,
          isAvailable: true,
        },
      ];

      return mockDrivers;
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      throw error;
    }
  }

  // Get ride estimates for different service types
  async getRideEstimates(pickup: Location, destination: Location): Promise<RideEstimate[]> {
    try {
      const distance = this.calculateDistance(pickup.coordinates, destination.coordinates);
      const serviceTypes: ServiceType[] = ['economy', 'standard', 'premium'];

      const estimates: RideEstimate[] = serviceTypes.map((serviceType) => {
        const pricing = this.calculatePricing(distance, serviceType);
        return {
          serviceType,
          pricing,
          estimatedPickupTime: Math.ceil(Math.random() * 10) + 2, // 2-12 minutes
          availableDrivers: Math.ceil(Math.random() * 5) + 1, // 1-6 drivers
        };
      });

      return estimates;
    } catch (error) {
      console.error('Error getting ride estimates:', error);
      throw error;
    }
  }
}

export const rideService = RideService.getInstance();
