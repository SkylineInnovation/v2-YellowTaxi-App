// Ride ordering types for React Native mobile app
import { Timestamp } from '@react-native-firebase/firestore';

export interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

export interface RideRequest {
  id?: string;
  customerId: string;
  pickup: Location;
  destination: Location;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  notes?: string;
  status: RideRequestStatus;
  pricing?: RidePricing;
  createdAt?: Timestamp;
  expiresAt?: Timestamp;
}

export interface RideOrder {
  id: string;
  customerId: string;
  driverId?: string;
  pickup: Location;
  destination: Location;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  status: RideStatus;
  pricing: RidePricing;
  driver?: DriverInfo;
  tracking?: RideTracking;
  timeline: RideEvent[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  notes?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  rating: number;
  vehicle: VehicleInfo;
  location: {
    lat: number;
    lng: number;
  };
  bearing?: number;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  plateNumber: string;
}

export interface RidePricing {
  baseFare: number;
  distanceFare: number;
  timeFare: number;
  surcharge: number;
  discount: number;
  total: number;
  currency: 'JOD';
  estimatedDistance?: number;
  estimatedDuration?: number;
}

export interface RideTracking {
  realTimeEnabled: boolean;
  driverLocation?: {
    lat: number;
    lng: number;
    bearing?: number;
    speed?: number;
  };
  estimatedArrival?: Timestamp;
  route?: {
    distance: number;
    duration: number;
    polyline?: string;
  };
}

export interface RideEvent {
  status: RideStatus;
  timestamp: Timestamp;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export type ServiceType = 'standard' | 'premium' | 'economy';

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export type RideRequestStatus = 'pending' | 'accepted' | 'rejected' | 'expired' | 'cancelled';

export type RideStatus = 
  | 'pending'
  | 'searching'
  | 'assigned'
  | 'driver_arriving'
  | 'driver_arrived'
  | 'picked_up'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// Driver-specific types
export interface Driver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  rating: number;
  totalRides: number;
  vehicle: VehicleInfo;
  location: {
    lat: number;
    lng: number;
    bearing?: number;
    speed?: number;
    accuracy?: number;
  };
  status: DriverStatus;
  isOnline: boolean;
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type DriverStatus = 'offline' | 'online' | 'busy' | 'break';

export interface DriverRideRequest {
  id: string;
  rideId: string;
  driverId: string;
  customerId: string;
  pickup: Location;
  destination: Location;
  serviceType: ServiceType;
  pricing: RidePricing;
  estimatedDistance: number;
  estimatedDuration: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expiresAt: Timestamp;
  createdAt: Timestamp;
  respondedAt?: Timestamp;
}

// Real-time location tracking
export interface LocationUpdate {
  userId: string;
  userType: 'customer' | 'driver';
  location: {
    lat: number;
    lng: number;
    bearing?: number;
    speed?: number;
    accuracy?: number;
  };
  timestamp: Timestamp;
  rideId?: string;
}

// Push notification types
export interface RideNotification {
  id: string;
  userId: string;
  userType: 'customer' | 'driver';
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Timestamp;
}

export type NotificationType = 
  | 'ride_request'
  | 'ride_accepted'
  | 'driver_assigned'
  | 'driver_arriving'
  | 'driver_arrived'
  | 'ride_started'
  | 'ride_completed'
  | 'ride_cancelled'
  | 'payment_processed';

export interface NearbyDriver {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  bearing: number;
  distance: number;
  estimatedArrival: number; // minutes
  rating: number;
  vehicle: VehicleInfo;
  isOnline: boolean;
  isAvailable: boolean;
}

export interface RideEstimate {
  serviceType: ServiceType;
  pricing: RidePricing;
  estimatedPickupTime: number; // minutes
  availableDrivers: number;
}

// Redux state interfaces
export interface RideState {
  currentRide: RideOrder | null;
  rideHistory: RideOrder[];
  activeRequest: RideRequest | null;
  nearbyDrivers: NearbyDriver[];
  rideEstimates: RideEstimate[];
  loading: boolean;
  error: string | null;
  trackingEnabled: boolean;
  userLocation: {
    lat: number;
    lng: number;
    bearing?: number;
  } | null;
  mapRegion: MapRegion | null;
}

// Driver-specific Redux state
export interface DriverState {
  profile: Driver | null;
  currentRide: RideOrder | null;
  rideRequests: DriverRideRequest[];
  rideHistory: RideOrder[];
  isOnline: boolean;
  isAvailable: boolean;
  location: {
    lat: number;
    lng: number;
    bearing?: number;
  } | null;
  earnings: {
    today: number;
    week: number;
    month: number;
  };
  loading: boolean;
  error: string | null;
}

// API request/response interfaces
export interface CreateRideRequestData {
  customerId: string;
  pickup: Location;
  destination: Location;
  serviceType: ServiceType;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateRideStatusData {
  rideId: string;
  status: RideStatus;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

// Location search interfaces
export interface LocationSearchResult {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId?: string;
  description?: string;
  types?: string[];
}

export interface LocationSearchSuggestion {
  id: string;
  title: string;
  subtitle: string;
  location: Location;
  type: 'recent' | 'favorite' | 'search';
}

// Map interfaces
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  title?: string;
  description?: string;
  type: 'pickup' | 'destination' | 'driver' | 'user';
}

// Service configuration
export interface ServiceTypeConfig {
  id: ServiceType;
  name: string;
  description: string;
  icon: string;
  baseFare: number;
  pricePerKm: number;
  pricePerMinute: number;
  features: string[];
  estimatedWaitTime: number; // minutes
}

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresSetup: boolean;
}
