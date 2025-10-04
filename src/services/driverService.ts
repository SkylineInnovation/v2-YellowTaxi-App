// Driver service for handling driver-specific functionality
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
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  writeBatch,
  arrayUnion,
  increment,
} from 'firebase/firestore';
import {
  Driver,
  DriverRideRequest,
  RideOrder,
  DriverStatus,
  LocationUpdate,
  RideStatus,
} from '../types/ride';

class DriverService {
  private static instance: DriverService;
  private readonly DRIVERS_COLLECTION = 'drivers';
  private readonly DRIVER_REQUESTS_COLLECTION = 'driver_ride_requests';
  private readonly ORDERS_COLLECTION = 'orders';
  private readonly LOCATION_UPDATES_COLLECTION = 'location_updates';

  static getInstance(): DriverService {
    if (!DriverService.instance) {
      DriverService.instance = new DriverService();
    }
    return DriverService.instance;
  }

  // Create or update driver profile
  async createOrUpdateDriverProfile(driverData: Partial<Driver>): Promise<void> {
    try {
      if (!isFirebaseConfigured()) {
        throw new Error('Firebase is not properly configured');
      }

      const now = FieldValue.serverTimestamp();
      const driverDocRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverData.id!);
      
      const existingDriver = await getDoc(driverDocRef);
      
      if (existingDriver.exists()) {
        // Update existing driver
        await updateDoc(driverDocRef, {
          ...driverData,
          updatedAt: now,
        });
      } else {
        // Create new driver
        await setDoc(driverDocRef, {
          ...driverData,
          rating: driverData.rating || 5.0,
          totalRides: driverData.totalRides || 0,
          status: driverData.status || 'offline',
          isOnline: driverData.isOnline || false,
          isAvailable: driverData.isAvailable || false,
          createdAt: now,
          updatedAt: now,
        });
      }

      console.log('Driver profile updated:', driverData.id);
    } catch (error) {
      console.error('Error creating/updating driver profile:', error);
      throw error;
    }
  }

  // Get driver profile
  async getDriverProfile(driverId: string): Promise<Driver | null> {
    try {
      const docRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return null;
      }

      return { id: docSnap.id, ...docSnap.data() } as Driver;
    } catch (error) {
      console.error('Error getting driver profile:', error);
      throw error;
    }
  }

  // Update driver status (online/offline/busy/break)
  async updateDriverStatus(driverId: string, status: DriverStatus, isOnline: boolean = true): Promise<void> {
    try {
      const driverDocRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
      await updateDoc(driverDocRef, {
        status,
        isOnline,
        isAvailable: status === 'online',
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.log('Driver status updated:', driverId, status);
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // Update driver location
  async updateDriverLocation(
    driverId: string,
    location: { lat: number; lng: number; bearing?: number; speed?: number }
  ): Promise<void> {
    try {
      const driverDocRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
      await updateDoc(driverDocRef, {
        location,
        lastLocationUpdate: FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  // Subscribe to ride requests for a driver
  subscribeToDriverRideRequests(
    driverId: string,
    callback: (requests: DriverRideRequest[]) => void
  ): () => void {
    const q = query(
      collection(firebaseFirestore, this.DRIVER_REQUESTS_COLLECTION),
      where('driverId', '==', driverId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: DriverRideRequest[] = [];
        snapshot.forEach((docSnap) => {
          requests.push({ id: docSnap.id, ...docSnap.data() } as DriverRideRequest);
        });
        callback(requests);
      },
        (error) => {
          console.error('Error subscribing to driver ride requests:', error);
        }
      );

    return unsubscribe;
  }

  // Accept a ride request
  async acceptRideRequest(requestId: string, driverId: string): Promise<void> {
    try {
      const batch = writeBatch(firebaseFirestore);
      const now = FieldValue.serverTimestamp();

      // Update the driver ride request
      const requestRef = doc(firebaseFirestore, this.DRIVER_REQUESTS_COLLECTION, requestId);
      
      batch.update(requestRef, {
        status: 'accepted',
        respondedAt: now,
      });

      // Get the request data to update the main ride order
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        throw new Error('Ride request not found');
      }

      const requestData = requestDoc.data() as DriverRideRequest;

      // Update the main ride order with driver assignment
      const orderRef = doc(firebaseFirestore, this.ORDERS_COLLECTION, requestData.rideId);

      // Get driver details
      const driverDocRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
      const driverDoc = await getDoc(driverDocRef);

      if (!driverDoc.exists()) {
        throw new Error('Driver not found');
      }

      const driverData = driverDoc.data() as Driver;

      batch.update(orderRef, {
        driverId,
        driver: {
          id: driverData.id,
          name: driverData.name,
          phone: driverData.phone,
          avatar: driverData.avatar,
          rating: driverData.rating,
          vehicle: driverData.vehicle,
          location: driverData.location,
        },
        status: 'assigned',
        'timeline': arrayUnion({
          status: 'assigned',
          timestamp: now,
          notes: `Driver ${driverData.name} assigned`,
        }),
        updatedAt: now,
      });

      // Update driver status to busy
      const driverRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
      
      batch.update(driverRef, {
        status: 'busy',
        isAvailable: false,
        updatedAt: now,
      });

      // Decline all other pending requests for this ride
      const otherRequestsQuery = query(
        collection(firebaseFirestore, this.DRIVER_REQUESTS_COLLECTION),
        where('rideId', '==', requestData.rideId),
        where('status', '==', 'pending')
      );
      const otherRequestsSnapshot = await getDocs(otherRequestsQuery);

      otherRequestsSnapshot.forEach((docSnap) => {
        if (docSnap.id !== requestId) {
          batch.update(docSnap.ref, {
            status: 'declined',
            respondedAt: now,
          });
        }
      });

      await batch.commit();
      console.log('Ride request accepted:', requestId);
    } catch (error) {
      console.error('Error accepting ride request:', error);
      throw error;
    }
  }

  // Decline a ride request
  async declineRideRequest(requestId: string, reason?: string): Promise<void> {
    try {
      const requestRef = doc(firebaseFirestore, this.DRIVER_REQUESTS_COLLECTION, requestId);
      await updateDoc(requestRef, {
        status: 'declined',
        respondedAt: FieldValue.serverTimestamp(),
        declineReason: reason,
      });

      console.log('Ride request declined:', requestId);
    } catch (error) {
      console.error('Error declining ride request:', error);
      throw error;
    }
  }

  // Update ride status (driver actions)
  async updateRideStatus(
    rideId: string,
    driverId: string,
    status: RideStatus,
    location?: { lat: number; lng: number },
    notes?: string
  ): Promise<void> {
    try {
      const batch = writeBatch(firebaseFirestore);
      const now = FieldValue.serverTimestamp();

      // Update the ride order
      const orderRef = doc(firebaseFirestore, this.ORDERS_COLLECTION, rideId);
      
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

      batch.update(orderRef, updateData);

      // Update driver location if provided
      if (location) {
        const driverRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
        
        batch.update(driverRef, {
          location,
          lastLocationUpdate: now,
        });
      }

      // If ride is completed or cancelled, make driver available again
      if (status === 'completed' || status === 'cancelled') {
        const driverRef = doc(firebaseFirestore, this.DRIVERS_COLLECTION, driverId);
        
        batch.update(driverRef, {
          status: 'online',
          isAvailable: true,
          updatedAt: now,
        });

        // Update driver's total rides count if completed
        if (status === 'completed') {
          batch.update(driverRef, {
            totalRides: increment(1),
          });
        }
      }

      await batch.commit();
      console.log('Ride status updated:', rideId, status);
    } catch (error) {
      console.error('Error updating ride status:', error);
      throw error;
    }
  }

  // Get driver's current ride
  async getDriverCurrentRide(driverId: string): Promise<RideOrder | null> {
    try {
      const q = query(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', 'in', ['assigned', 'driver_arriving', 'driver_arrived', 'picked_up', 'in_progress']),
        firestoreLimit(1)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const docSnap = snapshot.docs[0];
      const data = docSnap.data();

      // Transform Firestore document to RideOrder format
      const order: RideOrder = {
        id: docSnap.id,
        customerId: data.customer?.id || data.customerId,
        driverId: data.driverId,
        pickup: {
          address: data.locations?.pickup?.address || data.pickup?.address,
          coordinates: {
            lat: data.locations?.pickup?.coordinates?.latitude || data.pickup?.coordinates?.lat,
            lng: data.locations?.pickup?.coordinates?.longitude || data.pickup?.coordinates?.lng,
          },
          placeId: data.locations?.pickup?.placeId || data.pickup?.placeId,
        },
        destination: {
          address: data.locations?.destination?.address || data.destination?.address,
          coordinates: {
            lat: data.locations?.destination?.coordinates?.latitude || data.destination?.coordinates?.lat,
            lng: data.locations?.destination?.coordinates?.longitude || data.destination?.coordinates?.lng,
          },
          placeId: data.locations?.destination?.placeId || data.destination?.placeId,
        },
        serviceType: data.service?.type || data.serviceType,
        paymentMethod: data.payment?.method || data.paymentMethod,
        status: data.status?.current || data.status,
        pricing: data.pricing,
        driver: data.driver,
        timeline: data.status?.timeline || data.timeline || [],
        createdAt: data.metadata?.createdAt || data.createdAt,
        updatedAt: data.metadata?.updatedAt || data.updatedAt,
        completedAt: data.metadata?.completedAt || data.completedAt,
        notes: data.notes,
      };

      return order;
    } catch (error) {
      console.error('Error getting driver current ride:', error);
      throw error;
    }
  }

  // Subscribe to driver's current ride updates
  subscribeToDriverCurrentRide(
    driverId: string,
    callback: (ride: RideOrder | null) => void
  ): () => void {
    const q = query(
      collection(firebaseFirestore, this.ORDERS_COLLECTION),
      where('driverId', '==', driverId),
      where('status', 'in', ['assigned', 'driver_arriving', 'driver_arrived', 'picked_up', 'in_progress'])
    );
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          callback(null);
          return;
        }

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

          // Transform Firestore document to RideOrder format
          const order: RideOrder = {
            id: docSnap.id,
            customerId: data.customer?.id || data.customerId,
            driverId: data.driverId,
            pickup: {
              address: data.locations?.pickup?.address || data.pickup?.address,
              coordinates: {
                lat: data.locations?.pickup?.coordinates?.latitude || data.pickup?.coordinates?.lat,
                lng: data.locations?.pickup?.coordinates?.longitude || data.pickup?.coordinates?.lng,
              },
              placeId: data.locations?.pickup?.placeId || data.pickup?.placeId,
            },
            destination: {
              address: data.locations?.destination?.address || data.destination?.address,
              coordinates: {
                lat: data.locations?.destination?.coordinates?.latitude || data.destination?.coordinates?.lat,
                lng: data.locations?.destination?.coordinates?.longitude || data.destination?.coordinates?.lng,
              },
              placeId: data.locations?.destination?.placeId || data.destination?.placeId,
            },
            serviceType: data.service?.type || data.serviceType,
            paymentMethod: data.payment?.method || data.paymentMethod,
            status: data.status?.current || data.status,
            pricing: data.pricing,
            driver: data.driver,
            timeline: data.status?.timeline || data.timeline || [],
            createdAt: data.metadata?.createdAt || data.createdAt,
            updatedAt: data.metadata?.updatedAt || data.updatedAt,
            completedAt: data.metadata?.completedAt || data.completedAt,
            notes: data.notes,
          };

          callback(order);
        },
        (error) => {
          console.error('Error subscribing to driver current ride:', error);
        }
      );

    return unsubscribe;
  }

  // Get driver's ride history
  async getDriverRideHistory(driverId: string, limit: number = 20): Promise<RideOrder[]> {
    try {
      const q = query(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', 'in', ['completed', 'cancelled']),
        orderBy('completedAt', 'desc'),
        firestoreLimit(limit)
      );
      const snapshot = await getDocs(q);

      const orders: RideOrder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        
        // Transform Firestore document to RideOrder format
        const order: RideOrder = {
          id: docSnap.id,
          customerId: data.customer?.id || data.customerId,
          driverId: data.driverId,
          pickup: {
            address: data.locations?.pickup?.address || data.pickup?.address,
            coordinates: {
              lat: data.locations?.pickup?.coordinates?.latitude || data.pickup?.coordinates?.lat,
              lng: data.locations?.pickup?.coordinates?.longitude || data.pickup?.coordinates?.lng,
            },
            placeId: data.locations?.pickup?.placeId || data.pickup?.placeId,
          },
          destination: {
            address: data.locations?.destination?.address || data.destination?.address,
            coordinates: {
              lat: data.locations?.destination?.coordinates?.latitude || data.destination?.coordinates?.lat,
              lng: data.locations?.destination?.coordinates?.longitude || data.destination?.coordinates?.lng,
            },
            placeId: data.locations?.destination?.placeId || data.destination?.placeId,
          },
          serviceType: data.service?.type || data.serviceType,
          paymentMethod: data.payment?.method || data.paymentMethod,
          status: data.status?.current || data.status,
          pricing: data.pricing,
          driver: data.driver,
          timeline: data.status?.timeline || data.timeline || [],
          createdAt: data.metadata?.createdAt || data.createdAt,
          updatedAt: data.metadata?.updatedAt || data.updatedAt,
          completedAt: data.metadata?.completedAt || data.completedAt,
          notes: data.notes,
        };

        orders.push(order);
      });

      return orders;
    } catch (error) {
      console.error('Error getting driver ride history:', error);
      throw error;
    }
  }

  // Calculate driver earnings
  async getDriverEarnings(driverId: string): Promise<{
    today: number;
    week: number;
    month: number;
  }> {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Get completed rides for different periods
      const todayQuery = query(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', '==', 'completed'),
        where('completedAt', '>=', startOfDay)
      );
      const weekQuery = query(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', '==', 'completed'),
        where('completedAt', '>=', startOfWeek)
      );
      const monthQuery = query(
        collection(firebaseFirestore, this.ORDERS_COLLECTION),
        where('driverId', '==', driverId),
        where('status', '==', 'completed'),
        where('completedAt', '>=', startOfMonth)
      );
      
      const [todaySnapshot, weekSnapshot, monthSnapshot] = await Promise.all([
        getDocs(todayQuery),
        getDocs(weekQuery),
        getDocs(monthQuery),
      ]);

      const calculateEarnings = (snapshot: any) => {
        let total = 0;
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          total += data.pricing?.total || 0;
        });
        return total;
      };

      return {
        today: calculateEarnings(todaySnapshot),
        week: calculateEarnings(weekSnapshot),
        month: calculateEarnings(monthSnapshot),
      };
    } catch (error) {
      console.error('Error calculating driver earnings:', error);
      return { today: 0, week: 0, month: 0 };
    }
  }
}

export const driverService = DriverService.getInstance();
