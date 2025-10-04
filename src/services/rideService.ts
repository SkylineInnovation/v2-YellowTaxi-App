// Enhanced ride service for Expo mobile app with real-time tracking
import {
  firebaseFirestore,
  FieldValue,
  isFirebaseConfigured,
} from '../config/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
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
  Driver,
  DriverRideRequest,
  RideStatus,
} from '../types/ride';
import { locationService } from './locationService';
import { notificationService } from './notificationService';

class RideService {
  private static instance: RideService;
  private readonly RIDE_REQUESTS_COLLECTION = 'rideRequests';
  private readonly ORDERS_COLLECTION = 'orders';
  private readonly DRIVERS_COLLECTION = 'drivers';
  private readonly USERS_COLLECTION = 'users';
  private readonly DRIVER_REQUESTS_COLLECTION = 'driver_ride_requests';

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

  // Create a new ride request with driver matching
  async createRideRequest(requestData: CreateRideRequestData): Promise<string> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured');
      }

      // Get customer information
      const customerDocRef = doc(firebaseFirestore, this.USERS_COLLECTION, requestData.customerId);
      const customerDoc = await getDoc(customerDocRef);

      if (!customerDoc.exists()) {
        throw new Error('Customer not found');
      }

      const customer = customerDoc.data();
      const now = FieldValue.serverTimestamp();

      // Calculate pricing and route details
      const distance = this.calculateDistance(
        requestData.pickup.coordinates,
        requestData.destination.coordinates
      );
      const pricing = this.calculatePricing(distance, requestData.serviceType);
      
      // Get route details from Google Directions API
      const routeDetails = await locationService.getDirections(
        requestData.pickup.coordinates,
        requestData.destination.coordinates
      );

      // Create the main ride order
      const rideOrder: Omit<RideOrder, 'id'> = {
        customerId: requestData.customerId,
        pickup: requestData.pickup,
        destination: requestData.destination,
        serviceType: requestData.serviceType,
        paymentMethod: requestData.paymentMethod,
        notes: requestData.notes,
        status: 'searching',
        pricing,
        timeline: [{
          status: 'pending',
          timestamp: now as any,
          notes: 'Ride request created',
        }, {
          status: 'searching',
          timestamp: now as any,
          notes: 'Searching for nearby drivers',
        }],
        tracking: {
          realTimeEnabled: true,
          route: routeDetails ? {
            distance: routeDetails.distance,
            duration: routeDetails.duration,
            polyline: routeDetails.polyline,
          } : undefined,
        },
        createdAt: now as any,
        updatedAt: now as any,
      };

      // Create the ride order document
      const orderRef = await addDoc(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        rideOrder
      );

      // Find and notify nearby drivers
      await this.findAndNotifyNearbyDrivers(
        orderRef.id,
        requestData.pickup,
        requestData.destination,
        requestData.serviceType,
        pricing,
        distance,
        routeDetails?.duration || Math.ceil(distance * 2)
      );

      console.log('Ride request created and drivers notified:', orderRef.id);
      return orderRef.id;
    } catch (error) {
      console.error('Error creating ride request:', error);
      throw error;
    }
  }

  // Find and notify nearby drivers
  private async findAndNotifyNearbyDrivers(
    rideId: string,
    pickup: Location,
    destination: Location,
    serviceType: ServiceType,
    pricing: RidePricing,
    estimatedDistance: number,
    estimatedDuration: number
  ): Promise<void> {
    try {
      // Find nearby available drivers (within 10km radius)
      const nearbyDrivers = await this.findNearbyDrivers(pickup.coordinates, 10);
      
      if (nearbyDrivers.length === 0) {
        console.log('No nearby drivers found');
        return;
      }

      const batch = writeBatch(firebaseFirestore);
      const now = FieldValue.serverTimestamp();
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes to respond

      // Create driver ride requests for nearby drivers
      for (const driver of nearbyDrivers.slice(0, 5)) { // Limit to 5 drivers
        const driverRequest: Omit<DriverRideRequest, 'id'> = {
          rideId,
          driverId: driver.id,
          customerId: pickup.address.split(',')[0], // Extract customer ID from context
          pickup,
          destination,
          serviceType,
          pricing,
          estimatedDistance,
          estimatedDuration,
          status: 'pending',
          expiresAt: expiresAt as any,
          createdAt: now as any,
        };

        const requestRef = doc(
          collection(firebaseFirestore, this.DRIVER_REQUESTS_COLLECTION)
        );
        
        batch.set(requestRef, driverRequest);

        // Send notification to driver
        await notificationService.sendRideRequestNotification(
          driver.id,
          rideId,
          pickup.address,
          destination.address
        );
      }

      await batch.commit();
      console.log(`Notified ${nearbyDrivers.length} nearby drivers`);
    } catch (error) {
      console.error('Error finding and notifying nearby drivers:', error);
    }
  }

  // Find nearby available drivers
  private async findNearbyDrivers(
    location: { lat: number; lng: number },
    radiusKm: number = 10
  ): Promise<Driver[]> {
    try {
      // In a production app, you would use geospatial queries
      // For now, we'll get all online drivers and filter by distance
      const q = query(
        collection(firebaseFirestore, this.DRIVERS_COLLECTION),
        where('isOnline', '==', true),
        where('isAvailable', '==', true),
        where('status', '==', 'online')
      );
      const snapshot = await getDocs(q);

      const nearbyDrivers: Driver[] = [];
      
      snapshot.forEach((docSnap) => {
        const driver = { id: docSnap.id, ...docSnap.data() } as Driver;
        const distance = this.calculateDistance(location, driver.location);
        
        if (distance <= radiusKm) {
          nearbyDrivers.push(driver);
        }
      });

      // Sort by distance
      nearbyDrivers.sort((a, b) => {
        const distanceA = this.calculateDistance(location, a.location);
        const distanceB = this.calculateDistance(location, b.location);
        return distanceA - distanceB;
      });

      return nearbyDrivers;
    } catch (error) {
      console.error('Error finding nearby drivers:', error);
      return [];
    }
  }

  // Get ride request by ID
  async getRideRequest(requestId: string): Promise<RideRequest | null> {
    try {
      const docRef = doc(firebaseFirestore, this.RIDE_REQUESTS_COLLECTION, requestId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return { id: docSnap.id, ...docSnap.data() } as RideRequest;
    } catch (error) {
      console.error('Error getting ride request:', error);
      throw error;
    }
  }

  // Cancel a ride request
  async cancelRideRequest(requestId: string, reason?: string): Promise<void> {
    try {
      const docRef = doc(firebaseFirestore, this.RIDE_REQUESTS_COLLECTION, requestId);
      await updateDoc(docRef, {
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
    const q = query(
      collection(firebaseFirestore, this.RIDE_REQUESTS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: RideRequest[] = [];
        snapshot.forEach((docSnap) => {
          requests.push({ id: docSnap.id, ...docSnap.data() } as RideRequest);
        });
        callback(requests);
      },
      (error) => {
        console.error('Error subscribing to ride requests:', error);
      }
    );

    return unsubscribe;
  }

  // Subscribe to customer's current ride
  subscribeToCustomerCurrentRide(
    customerId: string,
    callback: (ride: RideOrder | null) => void
  ): () => void {
    const q = query(
      collection(firebaseFirestore, this.ORDERS_COLLECTION),
      where('customerId', '==', customerId),
      where('status', 'in', ['searching', 'assigned', 'driver_arriving', 'driver_arrived', 'picked_up', 'in_progress'])
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const docSnap = snapshot.docs[0]; // Get the first active ride
        const data = docSnap.data();
          
          const order: RideOrder = {
            id: docSnap.id,
            customerId: data.customerId,
            driverId: data.driverId,
            pickup: data.pickup,
            destination: data.destination,
            serviceType: data.serviceType,
            paymentMethod: data.paymentMethod,
            status: data.status,
            pricing: data.pricing,
            driver: data.driver,
            tracking: data.tracking,
            timeline: data.timeline || [],
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            completedAt: data.completedAt,
            notes: data.notes,
          };
          
          callback(order);
        },
        (error) => {
          console.error('Error subscribing to customer current ride:', error);
        }
      );

    return unsubscribe;
  }

  // Subscribe to customer's ride orders (history)
  subscribeToCustomerRideOrders(
    customerId: string,
    callback: (orders: RideOrder[]) => void
  ): () => void {
    const q = query(
      collection(firebaseFirestore, this.ORDERS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: RideOrder[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const order: RideOrder = {
            id: docSnap.id,
              customerId: data.customerId,
              driverId: data.driverId,
              pickup: data.pickup,
              destination: data.destination,
              serviceType: data.serviceType,
              paymentMethod: data.paymentMethod,
              status: data.status,
              pricing: data.pricing,
              driver: data.driver,
              tracking: data.tracking,
              timeline: data.timeline || [],
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              completedAt: data.completedAt,
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

  // Get nearby drivers for display on map
  async getNearbyDrivers(location: Location, radius: number = 5): Promise<NearbyDriver[]> {
    try {
      const drivers = await this.findNearbyDrivers(location.coordinates, radius);
      
      return drivers.map(driver => {
        const distance = this.calculateDistance(location.coordinates, driver.location);
        const estimatedArrival = Math.ceil(distance * 2); // Rough estimate: 2 minutes per km
        
        return {
          id: driver.id,
          name: driver.name,
          location: {
            lat: driver.location.lat,
            lng: driver.location.lng,
          },
          bearing: driver.location.bearing || 0,
          distance,
          estimatedArrival,
          rating: driver.rating,
          vehicle: driver.vehicle,
          isOnline: driver.isOnline,
          isAvailable: driver.isAvailable,
        };
      });
    } catch (error) {
      console.error('Error getting nearby drivers:', error);
      throw error;
    }
  }

  // Update ride status with notifications
  async updateRideStatus(
    rideId: string,
    status: RideStatus,
    userId?: string,
    userType?: 'customer' | 'driver',
    location?: { lat: number; lng: number },
    notes?: string
  ): Promise<void> {
    try {
      const now = FieldValue.serverTimestamp();
      
      // Update the ride order
      const updateData: any = {
        status,
        updatedAt: now,
        'timeline': arrayUnion({
          status,
          timestamp: now,
          notes,
          location,
        }),
      };

      if (status === 'completed') {
        updateData.completedAt = now;
      }

      const rideDocRef = doc(firebaseFirestore, this.ORDERS_COLLECTION, rideId);
      await updateDoc(rideDocRef, updateData);

      // Get ride details for notifications
      const rideDoc = await getDoc(rideDocRef);

      if (!rideDoc.exists()) {
        throw new Error('Ride not found');
      }

      const rideData = rideDoc.data();
      const customerId = rideData?.customerId;
      const driverId = rideData?.driverId;
      const driverName = rideData?.driver?.name;

      // Send appropriate notifications based on status
      switch (status) {
        case 'assigned':
          if (customerId && driverName) {
            await notificationService.sendRideAcceptedNotification(
              customerId,
              rideId,
              driverName,
              5 // Estimated arrival time
            );
          }
          break;
        
        case 'driver_arriving':
          if (customerId && driverName) {
            await notificationService.sendDriverArrivingNotification(
              customerId,
              rideId,
              driverName
            );
          }
          break;
        
        case 'driver_arrived':
          if (customerId && driverName) {
            await notificationService.sendDriverArrivedNotification(
              customerId,
              rideId,
              driverName
            );
          }
          break;
        
        case 'picked_up':
        case 'in_progress':
          if (customerId) {
            await notificationService.sendRideStartedNotification(
              customerId,
              rideId,
              rideData?.destination?.address || 'your destination'
            );
          }
          break;
        
        case 'completed':
          if (customerId) {
            await notificationService.sendRideCompletedNotification(
              customerId,
              'customer',
              rideId,
              rideData?.pricing?.total
            );
          }
          if (driverId) {
            await notificationService.sendRideCompletedNotification(
              driverId,
              'driver',
              rideId
            );
          }
          break;
        
        case 'cancelled':
          if (customerId) {
            await notificationService.sendRideCancelledNotification(
              customerId,
              'customer',
              rideId,
              notes
            );
          }
          if (driverId) {
            await notificationService.sendRideCancelledNotification(
              driverId,
              'driver',
              rideId,
              notes
            );
          }
          break;
      }

      console.log('Ride status updated:', rideId, status);
    } catch (error) {
      console.error('Error updating ride status:', error);
      throw error;
    }
  }

  // Get ride estimates for different service types with real driver data
  async getRideEstimates(pickup: Location, destination: Location): Promise<RideEstimate[]> {
    try {
      const distance = this.calculateDistance(pickup.coordinates, destination.coordinates);
      const serviceTypes: ServiceType[] = ['economy', 'standard', 'premium'];
      
      // Get nearby drivers to calculate realistic estimates
      const nearbyDrivers = await this.getNearbyDrivers(pickup, 10);

      const estimates: RideEstimate[] = serviceTypes.map((serviceType) => {
        const pricing = this.calculatePricing(distance, serviceType);
        const availableDriversForType = nearbyDrivers.filter(driver => 
          // In a real app, you might filter drivers by service type capability
          driver.isAvailable
        ).length;
        
        const estimatedPickupTime = nearbyDrivers.length > 0 
          ? Math.min(...nearbyDrivers.map(d => d.estimatedArrival))
          : Math.ceil(Math.random() * 10) + 5; // 5-15 minutes if no drivers

        return {
          serviceType,
          pricing,
          estimatedPickupTime,
          availableDrivers: availableDriversForType,
        };
      });

      return estimates;
    } catch (error) {
      console.error('Error getting ride estimates:', error);
      throw error;
    }
  }

  // Cancel ride
  async cancelRide(rideId: string, userId: string, userType: 'customer' | 'driver', reason?: string): Promise<void> {
    try {
      await this.updateRideStatus(rideId, 'cancelled', userId, userType, undefined, reason);
      console.log('Ride cancelled:', rideId);
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
    }
  }
}

export const rideService = RideService.getInstance();

// Export enhanced ride service with all new functionality
export { locationService } from './locationService';
export { driverService } from './driverService';
export { notificationService } from './notificationService';
