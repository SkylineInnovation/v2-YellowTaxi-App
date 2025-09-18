# 📱 YellowTaxi React Native Mobile App - Complete Architecture & Implementation Guide

## 🎯 Project Overview

### Mission
Create a comprehensive React Native mobile application that serves both customers and drivers in a single app, providing seamless integration with the existing YellowTaxi web application backend infrastructure.

### Key Features
- **Single App, Dual Interface**: Role-based navigation for customers and drivers
- **Real-time Location Services**: Live tracking, driver location updates, and route optimization
- **Unified Authentication**: Seamless integration with existing Firebase Auth system
- **Cross-Platform**: Native iOS and Android support with shared codebase
- **Offline Capabilities**: Essential features work without internet connection

---

## 🏗️ App Architecture

### Core Architecture Pattern
```
React Native App
├── 📱 Customer Interface
│   ├── Ride Booking
│   ├── Real-time Tracking
│   ├── Payment Management
│   └── Ride History
├── 🚗 Driver Interface
│   ├── Driver Dashboard
│   ├── Ride Requests
│   ├── Navigation & Tracking
│   └── Earnings Management
└── 🔄 Shared Components
    ├── Authentication
    ├── Maps & Location
    ├── Real-time Communication
    └── Profile Management
```

### Technology Stack
```typescript
// Core Framework
React Native: 0.73+
TypeScript: 5.0+
React Navigation: 6.x

// State Management
Redux Toolkit + RTK Query
React Context (for auth)
AsyncStorage (persistence)

// Backend Integration
Firebase SDK: 12.x
Firestore (real-time database)
Firebase Auth (phone authentication)
Firebase Messaging (push notifications)

// Maps & Location
React Native Maps
Google Maps SDK
React Native Geolocation
React Native Background Job

// UI & Styling
React Native Elements
React Native Vector Icons
React Native Reanimated 3
React Native Gesture Handler

// Real-time Communication
Socket.io Client
Firebase Real-time Listeners

// Payment Integration
Stripe React Native SDK
In-app Purchase (iOS/Android)

// Development Tools
Flipper (debugging)
Reactotron (state inspection)
ESLint + Prettier
Husky (git hooks)
```

---

## 🔐 Authentication System

### Authentication Flow
```typescript
// Authentication States
type AuthState = {
  user: FirebaseUser | null
  userProfile: UserDocument | null
  isAuthenticated: boolean
  userRole: UserRole[]
  loading: boolean
  error: string | null
}

// Role-based Navigation
const getInitialRoute = (userProfile: UserDocument) => {
  const roles = userProfile.roles
  
  if (roles.includes('driver')) {
    return 'DriverStack'
  } else if (roles.includes('customer')) {
    return 'CustomerStack'
  } else if (roles.includes('admin')) {
    return 'AdminStack'
  }
  
  return 'OnboardingStack'
}
```

### Authentication Methods
**Phone/OTP Authentication (Primary Method)**
- Firebase Phone Auth with reCAPTCHA verification
- SMS verification via josms.net gateway integration
- International phone number support with E.164 format
- Automatic country code detection
- Resend OTP functionality with rate limiting
- Phone number verification and validation
- Seamless integration with existing web application auth system

### Phone Authentication Implementation
```typescript
// PhoneAuthService.ts
class PhoneAuthService {
  private recaptchaVerifier: any = null

  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    try {
      // Format phone number to E.164 format
      const formattedPhone = this.formatPhoneNumber(phoneNumber)

      // Initialize reCAPTCHA verifier
      if (!this.recaptchaVerifier) {
        this.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
          size: 'invisible',
          callback: () => console.log('reCAPTCHA solved'),
          'error-callback': () => console.log('reCAPTCHA error'),
        })
      }

      // Send OTP
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        this.recaptchaVerifier
      )

      return confirmationResult
    } catch (error) {
      console.error('Send OTP error:', error)
      throw new Error('Failed to send OTP. Please try again.')
    }
  }

  async verifyOTP(confirmationResult: ConfirmationResult, otp: string): Promise<UserCredential> {
    try {
      const result = await confirmationResult.confirm(otp)
      return result
    } catch (error) {
      console.error('Verify OTP error:', error)
      throw new Error('Invalid OTP. Please check and try again.')
    }
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Add country code if not present
    if (!cleaned.startsWith('962')) {
      return `+962${cleaned}`
    }

    return `+${cleaned}`
  }
}
```

### Session Management
```typescript
// Auth Context Provider
interface AuthContextType {
  user: FirebaseUser | null
  userProfile: UserDocument | null
  sendOTP: (phoneNumber: string) => Promise<ConfirmationResult>
  verifyOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<UserDocument>) => Promise<void>
  hasRole: (role: UserRole) => boolean
  isDriver: boolean
  isCustomer: boolean
  isAdmin: boolean
  loading: boolean
  error: string | null
}
```

---

## 🗺️ Navigation Structure

### Root Navigation
```typescript
// App.tsx - Root Navigator
const RootNavigator = () => {
  const { isAuthenticated, userProfile, loading } = useAuth()
  
  if (loading) return <SplashScreen />
  
  return (
    <NavigationContainer>
      {isAuthenticated ? (
        <AuthenticatedNavigator userProfile={userProfile} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  )
}

// Authenticated Navigator with Role-based Routing
const AuthenticatedNavigator = ({ userProfile }: { userProfile: UserDocument }) => {
  const isDriver = userProfile.roles.includes('driver')
  const isCustomer = userProfile.roles.includes('customer')
  const isAdmin = userProfile.roles.includes('admin')
  
  return (
    <Tab.Navigator>
      {isCustomer && <Tab.Screen name="CustomerStack" component={CustomerStack} />}
      {isDriver && <Tab.Screen name="DriverStack" component={DriverStack} />}
      {isAdmin && <Tab.Screen name="AdminStack" component={AdminStack} />}
      <Tab.Screen name="ProfileStack" component={ProfileStack} />
    </Tab.Navigator>
  )
}
```

### Customer Navigation Stack
```typescript
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
    <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} />
    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
  </Stack.Navigator>
)

// Phone Login Screen
const PhoneLoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const { sendOTP } = useAuth()
  const navigation = useNavigation()

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number')
      return
    }

    setLoading(true)
    try {
      const confirmationResult = await sendOTP(phoneNumber)
      navigation.navigate('OTPVerification', {
        phoneNumber,
        confirmationResult
      })
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to YellowTaxi</Text>
      <Text style={styles.subtitle}>Enter your phone number to continue</Text>

      <PhoneInput
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Phone number"
        defaultCountry="JO"
        autoFocus
      />

      <Button
        title="Send OTP"
        onPress={handleSendOTP}
        loading={loading}
        disabled={!phoneNumber.trim()}
      />
    </View>
  )
}

// OTP Verification Screen
const OTPVerificationScreen = ({ route }) => {
  const [otp, setOTP] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const { phoneNumber, confirmationResult } = route.params
  const { verifyOTP, sendOTP } = useAuth()
  const navigation = useNavigation()

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      await verifyOTP(confirmationResult, otp)
      // Navigation will be handled by auth state change
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResendLoading(true)
    try {
      const newConfirmationResult = await sendOTP(phoneNumber)
      // Update confirmation result
      navigation.setParams({ confirmationResult: newConfirmationResult })
      Alert.alert('Success', 'OTP sent successfully')
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Phone Number</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {phoneNumber}
      </Text>

      <OTPInput
        value={otp}
        onChangeText={setOTP}
        length={6}
        autoFocus
      />

      <Button
        title="Verify OTP"
        onPress={handleVerifyOTP}
        loading={loading}
        disabled={otp.length !== 6}
      />

      <Button
        title="Resend OTP"
        variant="outline"
        onPress={handleResendOTP}
        loading={resendLoading}
      />
    </View>
  )
}
```

### Customer Navigation Stack
```typescript
const CustomerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="RideBooking" component={RideBookingScreen} />
    <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
    <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
    <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
  </Stack.Navigator>
)
```

### Driver Navigation Stack
```typescript
const DriverStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
    <Stack.Screen name="RideRequests" component={RideRequestsScreen} />
    <Stack.Screen name="ActiveRide" component={ActiveRideScreen} />
    <Stack.Screen name="Earnings" component={EarningsScreen} />
    <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
  </Stack.Navigator>
)
```

---

## 🛠️ Core Features Implementation

### 1. Customer Features

#### Ride Booking Interface
```typescript
// RideBookingScreen.tsx
const RideBookingScreen = () => {
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null)
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null)
  const [serviceType, setServiceType] = useState<ServiceType>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  
  const { createRideRequest, loading } = useRideRequests()
  const { nearbyDrivers } = useNearbyDrivers(pickupLocation)
  
  const handleBookRide = async () => {
    if (!pickupLocation || !destinationLocation) return
    
    const rideData: CreateRideRequestData = {
      customerId: user.uid,
      pickup: pickupLocation,
      destination: destinationLocation,
      serviceType,
      paymentMethod,
    }
    
    await createRideRequest(rideData)
    navigation.navigate('RideTracking')
  }
  
  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {/* Map with pickup/destination markers */}
      </MapView>
      
      <View style={styles.bottomSheet}>
        <LocationInput
          placeholder="Pickup location"
          value={pickupLocation}
          onChange={setPickupLocation}
        />
        <LocationInput
          placeholder="Destination"
          value={destinationLocation}
          onChange={setDestinationLocation}
        />
        
        <ServiceTypeSelector
          value={serviceType}
          onChange={setServiceType}
        />
        
        <PaymentMethodSelector
          value={paymentMethod}
          onChange={setPaymentMethod}
        />
        
        <Button
          title="Book Ride"
          onPress={handleBookRide}
          loading={loading}
          disabled={!pickupLocation || !destinationLocation}
        />
      </View>
    </View>
  )
}
```

#### Real-time Ride Tracking
```typescript
// RideTrackingScreen.tsx
const RideTrackingScreen = () => {
  const { activeOrder } = useOrders()
  const { driverLocation } = useDriverLiveLocation(activeOrder?.driver?.id)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  
  useEffect(() => {
    // Subscribe to real-time order updates
    const unsubscribe = subscribeToOrder(activeOrder?.id, (order) => {
      // Update order status, driver location, etc.
    })
    
    return unsubscribe
  }, [activeOrder?.id])
  
  useEffect(() => {
    // Track user location
    const watchId = Geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => console.error('Location error:', error),
      { enableHighAccuracy: true, distanceFilter: 10 }
    )
    
    return () => Geolocation.clearWatch(watchId)
  }, [])
  
  return (
    <View style={styles.container}>
      <MapView style={styles.map}>
        {/* User location marker */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Your location" />
        )}
        
        {/* Driver location marker */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Driver location"
            image={require('../assets/taxi-icon.png')}
          />
        )}
        
        {/* Route polyline */}
        {activeOrder && (
          <Polyline
            coordinates={[
              activeOrder.locations.pickup.coordinates,
              activeOrder.locations.destination.coordinates,
            ]}
            strokeColor="#007AFF"
            strokeWidth={3}
          />
        )}
      </MapView>
      
      <RideStatusCard order={activeOrder} />
      <DriverInfoCard driver={activeOrder?.driver} />
    </View>
  )
}
```

### 2. Driver Features

#### Driver Dashboard
```typescript
// DriverDashboardScreen.tsx
const DriverDashboardScreen = () => {
  const [isOnline, setIsOnline] = useState(false)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const { pendingRequests } = useRideRequests()
  const { activeOrder } = useOrders()
  const { updateDriverStatus, updateDriverLocation } = useDriver()
  
  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline
    setIsOnline(newStatus)
    
    await updateDriverStatus(user.uid, newStatus, newStatus)
    
    if (newStatus && currentLocation) {
      // Start location tracking when going online
      startLocationTracking()
    } else {
      // Stop location tracking when going offline
      stopLocationTracking()
    }
  }
  
  const startLocationTracking = () => {
    const watchId = Geolocation.watchPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setCurrentLocation(location)
        
        // Update driver location in Firestore
        await updateDriverLocation(
          user.uid,
          new GeoPoint(location.lat, location.lng),
          position.coords.heading || 0,
          position.coords.speed || 0,
          position.coords.accuracy || 0
        )
      },
      (error) => console.error('Location error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000, // Update every 5 seconds
      }
    )
    
    return watchId
  }
  
  return (
    <View style={styles.container}>
      <DriverStatusHeader
        isOnline={isOnline}
        onToggle={toggleOnlineStatus}
      />
      
      {activeOrder ? (
        <ActiveRideCard order={activeOrder} />
      ) : (
        <PendingRequestsList requests={pendingRequests} />
      )}
      
      <EarningsCard />
      <PerformanceCard />
    </View>
  )
}
```

#### Ride Request Handling
```typescript
// RideRequestCard.tsx
const RideRequestCard = ({ request }: { request: RideRequestDocument }) => {
  const { acceptRideRequest, rejectRideRequest } = useRideRequests()
  const [isAccepting, setIsAccepting] = useState(false)
  
  const handleAccept = async () => {
    setIsAccepting(true)
    try {
      await acceptRideRequest(request.id, user.uid, {
        name: userProfile.profile.firstName + ' ' + userProfile.profile.lastName,
        phone: userProfile.profile.phone,
        avatar: userProfile.profile.avatar,
        vehicle: driverProfile.vehicle,
        location: currentLocation,
      })
      
      // Navigate to active ride screen
      navigation.navigate('ActiveRide', { orderId: request.id })
    } catch (error) {
      Alert.alert('Error', 'Failed to accept ride request')
    } finally {
      setIsAccepting(false)
    }
  }
  
  const handleReject = async () => {
    await rejectRideRequest(request.id, user.uid, 'Driver declined')
  }
  
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.customerName}>{request.customer.name}</Text>
        <Text style={styles.fare}>JD {request.pricing.total.toFixed(2)}</Text>
      </View>
      
      <View style={styles.locations}>
        <LocationRow
          icon="pickup"
          address={request.locations.pickup.address}
        />
        <LocationRow
          icon="destination"
          address={request.locations.destination.address}
        />
      </View>
      
      <View style={styles.actions}>
        <Button
          title="Decline"
          variant="outline"
          onPress={handleReject}
        />
        <Button
          title="Accept"
          variant="primary"
          onPress={handleAccept}
          loading={isAccepting}
        />
      </View>
    </Card>
  )
}
```

---

## 🔄 Real-time Communication

### WebSocket Integration
```typescript
// Real-time service for live updates
class RealTimeService {
  private socket: SocketIOClient.Socket | null = null
  
  connect(userId: string, userRole: UserRole[]) {
    this.socket = io(SOCKET_URL, {
      auth: { userId, userRole },
      transports: ['websocket'],
    })
    
    this.socket.on('connect', () => {
      console.log('Connected to real-time service')
    })
    
    // Driver-specific events
    if (userRole.includes('driver')) {
      this.socket.on('new_ride_request', this.handleNewRideRequest)
      this.socket.on('ride_cancelled', this.handleRideCancelled)
    }
    
    // Customer-specific events
    if (userRole.includes('customer')) {
      this.socket.on('driver_assigned', this.handleDriverAssigned)
      this.socket.on('driver_location_update', this.handleDriverLocationUpdate)
      this.socket.on('ride_status_update', this.handleRideStatusUpdate)
    }
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
  
  // Event handlers
  private handleNewRideRequest = (request: RideRequestDocument) => {
    // Show push notification
    PushNotification.localNotification({
      title: 'New Ride Request',
      message: `${request.customer.name} needs a ride - JD ${request.pricing.total}`,
      data: { requestId: request.id },
    })
  }
  
  private handleDriverLocationUpdate = (location: Location) => {
    // Update driver location in real-time
    store.dispatch(updateDriverLocation(location))
  }
}
```

### Firebase Real-time Listeners
```typescript
// useRealTimeOrders hook
const useRealTimeOrders = (userId: string, userRole: UserRole) => {
  const [orders, setOrders] = useState<OrderDocument[]>([])
  
  useEffect(() => {
    let unsubscribe: Unsubscribe
    
    if (userRole === 'customer') {
      // Listen to customer's orders
      unsubscribe = onSnapshot(
        query(
          collection(db, 'orders'),
          where('customer.id', '==', userId),
          orderBy('metadata.createdAt', 'desc')
        ),
        (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as OrderDocument[]
          setOrders(orders)
        }
      )
    } else if (userRole === 'driver') {
      // Listen to driver's assigned orders
      unsubscribe = onSnapshot(
        query(
          collection(db, 'orders'),
          where('driver.id', '==', userId),
          orderBy('metadata.createdAt', 'desc')
        ),
        (snapshot) => {
          const orders = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as OrderDocument[]
          setOrders(orders)
        }
      )
    }
    
    return () => unsubscribe?.()
  }, [userId, userRole])
  
  return orders
}
```

---

## 📍 Location Services

### Location Permissions & Setup
```typescript
// LocationService.ts
class LocationService {
  static async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      const permission = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
      return permission === RESULTS.GRANTED
    } else {
      const permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)
      return permission === RESULTS.GRANTED
    }
  }
  
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      )
    })
  }
  
  static startLocationTracking(
    callback: (location: Location) => void,
    options: LocationOptions = {}
  ): number {
    return Geolocation.watchPosition(
      (position) => {
        callback({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => console.error('Location tracking error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
        ...options,
      }
    )
  }
  
  static stopLocationTracking(watchId: number) {
    Geolocation.clearWatch(watchId)
  }
}
```

### Background Location Tracking
```typescript
// BackgroundLocationService.ts
import BackgroundJob from 'react-native-background-job'

class BackgroundLocationService {
  static start(driverId: string) {
    BackgroundJob.start({
      jobKey: 'locationTracking',
      period: 5000, // Update every 5 seconds
    })
    
    BackgroundJob.register({
      jobKey: 'locationTracking',
      job: async () => {
        try {
          const location = await LocationService.getCurrentLocation()
          
          // Update driver location in Firestore
          await updateDoc(doc(db, 'drivers', driverId), {
            'location.current': new GeoPoint(location.lat, location.lng),
            'location.lastUpdated': serverTimestamp(),
          })
        } catch (error) {
          console.error('Background location update failed:', error)
        }
      },
    })
  }
  
  static stop() {
    BackgroundJob.stop({
      jobKey: 'locationTracking',
    })
  }
}
```

---

## 💳 Payment Integration

### Payment Methods Setup
```typescript
// PaymentService.ts
class PaymentService {
  // Initialize Stripe
  static async initializeStripe() {
    await initStripe({
      publishableKey: STRIPE_PUBLISHABLE_KEY,
      merchantIdentifier: 'merchant.com.yellowtaxi',
    })
  }
  
  // Process card payment
  static async processCardPayment(
    amount: number,
    currency: string = 'JOD',
    orderId: string
  ): Promise<PaymentResult> {
    try {
      // Create payment intent on backend
      const { clientSecret } = await createPaymentIntent({
        amount: amount * 100, // Convert to cents
        currency,
        orderId,
      })
      
      // Confirm payment with Stripe
      const { paymentIntent, error } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      return {
        success: true,
        transactionId: paymentIntent.id,
        method: 'card',
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      }
    }
  }
  
  // Handle cash payment
  static async processCashPayment(orderId: string): Promise<PaymentResult> {
    return {
      success: true,
      transactionId: `cash_${orderId}_${Date.now()}`,
      method: 'cash',
    }
  }
}
```

### Payment Methods Screen
```typescript
// PaymentMethodsScreen.tsx
const PaymentMethodsScreen = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  
  const addPaymentMethod = async () => {
    try {
      const { paymentMethod, error } = await createPaymentMethod({
        paymentMethodType: 'Card',
      })
      
      if (error) {
        Alert.alert('Error', error.message)
        return
      }
      
      // Save payment method to user profile
      await savePaymentMethod(user.uid, paymentMethod)
      
      // Refresh payment methods list
      loadPaymentMethods()
    } catch (error) {
      Alert.alert('Error', 'Failed to add payment method')
    }
  }
  
  return (
    <ScrollView style={styles.container}>
      <Section title="Payment Methods">
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            selected={selectedMethod === method.id}
            onSelect={() => setSelectedMethod(method.id)}
          />
        ))}
        
        <Button
          title="Add Payment Method"
          onPress={addPaymentMethod}
          variant="outline"
        />
      </Section>
      
      <Section title="Cash Payment">
        <PaymentMethodCard
          method={{ id: 'cash', type: 'cash', title: 'Cash' }}
          selected={selectedMethod === 'cash'}
          onSelect={() => setSelectedMethod('cash')}
        />
      </Section>
    </ScrollView>
  )
}
```

---

## 📱 Push Notifications

### Firebase Cloud Messaging Setup
```typescript
// NotificationService.ts
class NotificationService {
  static async initialize() {
    // Request permission
    const authStatus = await messaging().requestPermission()
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL
    
    if (!enabled) {
      console.log('Push notification permission denied')
      return
    }
    
    // Get FCM token
    const token = await messaging().getToken()
    console.log('FCM Token:', token)
    
    // Save token to user profile
    await this.saveTokenToDatabase(token)
    
    // Listen for token refresh
    messaging().onTokenRefresh(this.saveTokenToDatabase)
    
    // Handle foreground messages
    messaging().onMessage(this.handleForegroundMessage)
    
    // Handle background messages
    messaging().setBackgroundMessageHandler(this.handleBackgroundMessage)
  }
  
  static async saveTokenToDatabase(token: string) {
    const user = auth().currentUser
    if (!user) return
    
    await updateDoc(doc(db, 'users', user.uid), {
      'settings.fcmToken': token,
      'settings.lastTokenUpdate': serverTimestamp(),
    })
  }
  
  static handleForegroundMessage = (message: FirebaseMessagingTypes.RemoteMessage) => {
    // Show in-app notification
    showInAppNotification({
      title: message.notification?.title,
      body: message.notification?.body,
      data: message.data,
    })
  }
  
  static handleBackgroundMessage = async (message: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('Background message:', message)
    
    // Handle different notification types
    if (message.data?.type === 'ride_request') {
      // Show local notification for ride request
      PushNotification.localNotification({
        title: 'New Ride Request',
        message: message.notification?.body || 'You have a new ride request',
        data: message.data,
      })
    }
  }
}
```

### Local Notifications
```typescript
// LocalNotificationService.ts
class LocalNotificationService {
  static configure() {
    PushNotification.configure({
      onNotification: (notification) => {
        if (notification.userInteraction) {
          // Handle notification tap
          this.handleNotificationTap(notification)
        }
      },
      requestPermissions: Platform.OS === 'ios',
    })
  }
  
  static showRideRequestNotification(request: RideRequestDocument) {
    PushNotification.localNotification({
      title: 'New Ride Request',
      message: `${request.customer.name} needs a ride - JD ${request.pricing.total}`,
      data: {
        type: 'ride_request',
        requestId: request.id,
      },
      actions: ['Accept', 'Decline'],
      category: 'RIDE_REQUEST',
    })
  }
  
  static showDriverArrivedNotification(driver: DriverInfo) {
    PushNotification.localNotification({
      title: 'Driver Arrived',
      message: `${driver.name} has arrived at your pickup location`,
      data: {
        type: 'driver_arrived',
        driverId: driver.id,
      },
    })
  }
  
  static handleNotificationTap(notification: any) {
    const { type, requestId, orderId } = notification.data
    
    switch (type) {
      case 'ride_request':
        NavigationService.navigate('RideRequests', { requestId })
        break
      case 'driver_arrived':
        NavigationService.navigate('RideTracking', { orderId })
        break
      default:
        break
    }
  }
}
```

---

## 🔧 API Integration

### API Service Layer
```typescript
// ApiService.ts
class ApiService {
  private static baseURL = 'https://your-api-domain.com/api'
  
  // Generic API call method
  static async call<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const user = auth().currentUser
    const token = user ? await user.getIdToken() : null
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return response.json()
  }
  
  // Ride-related API calls
  static async createRideRequest(data: CreateRideRequestData) {
    return this.call<{ requestId: string }>('/rides/request', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  static async acceptRideRequest(requestId: string, driverData: any) {
    return this.call<{ orderId: string }>(`/rides/request/${requestId}/accept`, {
      method: 'POST',
      body: JSON.stringify(driverData),
    })
  }
  
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.call(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  }
  
  // Driver-related API calls
  static async updateDriverLocation(driverId: string, location: Location) {
    return this.call(`/drivers/${driverId}/location`, {
      method: 'PATCH',
      body: JSON.stringify(location),
    })
  }
  
  static async updateDriverStatus(driverId: string, online: boolean, available: boolean) {
    return this.call(`/drivers/${driverId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ online, available }),
    })
  }
  
  // Payment-related API calls
  static async createPaymentIntent(data: PaymentIntentData) {
    return this.call<{ clientSecret: string }>('/payments/intent', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  
  static async processPayment(orderId: string, paymentData: any) {
    return this.call<PaymentResult>(`/payments/process`, {
      method: 'POST',
      body: JSON.stringify({ orderId, ...paymentData }),
    })
  }
}
```

### Firebase Service Integration
```typescript
// FirebaseService.ts
class FirebaseService {
  // User management
  static async createUser(userData: CreateUserData): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  }
  
  static async updateUser(userId: string, data: Partial<UserDocument>) {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updatedAt: serverTimestamp(),
    })
  }
  
  // Order management
  static async createOrder(orderData: CreateOrderData): Promise<string> {
    const docRef = await addDoc(collection(db, 'orders'), {
      ...orderData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    
    return docRef.id
  }
  
  static async updateOrderStatus(orderId: string, status: OrderStatus) {
    await updateDoc(doc(db, 'orders', orderId), {
      'status.current': status,
      'status.timeline': arrayUnion({
        status,
        timestamp: serverTimestamp(),
      }),
      updatedAt: serverTimestamp(),
    })
  }
  
  // Real-time subscriptions
  static subscribeToOrders(
    userId: string,
    userRole: UserRole,
    callback: (orders: OrderDocument[]) => void
  ): Unsubscribe {
    const field = userRole === 'customer' ? 'customer.id' : 'driver.id'
    
    return onSnapshot(
      query(
        collection(db, 'orders'),
        where(field, '==', userId),
        orderBy('createdAt', 'desc')
      ),
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as OrderDocument[]
        callback(orders)
      }
    )
  }
  
  static subscribeToDriverLocation(
    driverId: string,
    callback: (location: Location) => void
  ): Unsubscribe {
    return onSnapshot(doc(db, 'drivers', driverId), (doc) => {
      const data = doc.data()
      if (data?.location?.current) {
        callback({
          lat: data.location.current.latitude,
          lng: data.location.current.longitude,
        })
      }
    })
  }
}
```

---

## 🎨 UI/UX Design System

### Design Principles
- **Consistency**: Unified design language across customer and driver interfaces
- **Accessibility**: WCAG 2.1 AA compliance with screen reader support
- **Performance**: 60fps animations with React Native Reanimated 3
- **Platform-specific**: Native iOS and Android design patterns

### Color Palette
```typescript
// theme/colors.ts
export const colors = {
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    500: '#F59E0B', // Yellow Taxi brand color
    600: '#D97706',
    900: '#78350F',
  },
  secondary: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    500: '#64748B',
    600: '#475569',
    900: '#0F172A',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
}
```

### Typography System
```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    regular: Platform.OS === 'ios' ? 'SF Pro Display' : 'Roboto',
    medium: Platform.OS === 'ios' ? 'SF Pro Display Medium' : 'Roboto Medium',
    bold: Platform.OS === 'ios' ? 'SF Pro Display Bold' : 'Roboto Bold',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}
```

### Component Library
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
  ]

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor(variant)} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={[styles.text, styles[`${variant}Text`]]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}
```

---

## 📊 State Management

### Redux Store Setup
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

import authSlice from './slices/authSlice'
import ordersSlice from './slices/ordersSlice'
import driversSlice from './slices/driversSlice'
import locationSlice from './slices/locationSlice'
import { apiSlice } from './api/apiSlice'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'location'], // Only persist auth and location
}

const rootReducer = combineReducers({
  auth: persistReducer(persistConfig, authSlice),
  orders: ordersSlice,
  drivers: driversSlice,
  location: locationSlice,
  api: apiSlice.reducer,
})

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(apiSlice.middleware),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

### Auth Slice
```typescript
// store/slices/authSlice.ts
interface AuthState {
  user: FirebaseUser | null
  userProfile: UserDocument | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setUserProfile: (state, action) => {
      state.userProfile = action.payload
    },
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setError: (state, action) => {
      state.error = action.payload
    },
    clearAuth: (state) => {
      state.user = null
      state.userProfile = null
      state.isAuthenticated = false
      state.error = null
    },
  },
})

export const { setUser, setUserProfile, setLoading, setError, clearAuth } = authSlice.actions
export default authSlice.reducer
```

### RTK Query API Slice
```typescript
// store/api/apiSlice.ts
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: async (headers, { getState }) => {
      const user = auth().currentUser
      if (user) {
        const token = await user.getIdToken()
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Order', 'RideRequest', 'Driver', 'User'],
  endpoints: (builder) => ({
    // Orders
    getOrders: builder.query<OrderDocument[], { userId: string; role: UserRole }>({
      query: ({ userId, role }) => `/orders?userId=${userId}&role=${role}`,
      providesTags: ['Order'],
    }),
    createOrder: builder.mutation<{ orderId: string }, CreateOrderData>({
      query: (data) => ({
        url: '/orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Order'],
    }),
    updateOrderStatus: builder.mutation<void, { orderId: string; status: OrderStatus }>({
      query: ({ orderId, status }) => ({
        url: `/orders/${orderId}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Order'],
    }),

    // Ride Requests
    createRideRequest: builder.mutation<{ requestId: string }, CreateRideRequestData>({
      query: (data) => ({
        url: '/ride-requests',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['RideRequest'],
    }),
    acceptRideRequest: builder.mutation<{ orderId: string }, { requestId: string; driverData: any }>({
      query: ({ requestId, driverData }) => ({
        url: `/ride-requests/${requestId}/accept`,
        method: 'POST',
        body: driverData,
      }),
      invalidatesTags: ['RideRequest', 'Order'],
    }),

    // Drivers
    updateDriverLocation: builder.mutation<void, { driverId: string; location: Location }>({
      query: ({ driverId, location }) => ({
        url: `/drivers/${driverId}/location`,
        method: 'PATCH',
        body: location,
      }),
      invalidatesTags: ['Driver'],
    }),
    updateDriverStatus: builder.mutation<void, { driverId: string; online: boolean; available: boolean }>({
      query: ({ driverId, online, available }) => ({
        url: `/drivers/${driverId}/status`,
        method: 'PATCH',
        body: { online, available },
      }),
      invalidatesTags: ['Driver'],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCreateRideRequestMutation,
  useAcceptRideRequestMutation,
  useUpdateDriverLocationMutation,
  useUpdateDriverStatusMutation,
} = apiSlice
```

---

## 🧪 Testing Strategy

### Unit Testing Setup
```typescript
// __tests__/components/Button.test.tsx
import React from 'react'
import { render, fireEvent } from '@testing-library/react-native'
import { Button } from '../../src/components/ui/Button'

describe('Button Component', () => {
  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    )

    expect(getByText('Test Button')).toBeTruthy()
  })

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    )

    fireEvent.press(getByText('Test Button'))
    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  it('shows loading indicator when loading', () => {
    const { getByTestId } = render(
      <Button title="Test Button" onPress={() => {}} loading={true} />
    )

    expect(getByTestId('loading-indicator')).toBeTruthy()
  })

  it('is disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} disabled={true} />
    )

    fireEvent.press(getByText('Test Button'))
    expect(mockOnPress).not.toHaveBeenCalled()
  })
})
```

### Integration Testing
```typescript
// __tests__/screens/RideBookingScreen.test.tsx
import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import { store } from '../../src/store'
import { RideBookingScreen } from '../../src/screens/customer/RideBookingScreen'

// Mock dependencies
jest.mock('react-native-maps', () => 'MapView')
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}))

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}

describe('RideBookingScreen', () => {
  it('renders pickup and destination inputs', () => {
    const { getByPlaceholderText } = renderWithProvider(<RideBookingScreen />)

    expect(getByPlaceholderText('Pickup location')).toBeTruthy()
    expect(getByPlaceholderText('Destination')).toBeTruthy()
  })

  it('enables book ride button when both locations are selected', async () => {
    const { getByPlaceholderText, getByText } = renderWithProvider(<RideBookingScreen />)

    // Simulate location selection
    fireEvent.changeText(getByPlaceholderText('Pickup location'), 'Amman, Jordan')
    fireEvent.changeText(getByPlaceholderText('Destination'), 'Irbid, Jordan')

    await waitFor(() => {
      expect(getByText('Book Ride')).not.toBeDisabled()
    })
  })

  it('creates ride request when book ride is pressed', async () => {
    const mockCreateRideRequest = jest.fn()

    // Mock the hook
    jest.mock('../../src/hooks/useRideRequests', () => ({
      useRideRequests: () => ({
        createRideRequest: mockCreateRideRequest,
        loading: false,
      }),
    }))

    const { getByText } = renderWithProvider(<RideBookingScreen />)

    fireEvent.press(getByText('Book Ride'))

    await waitFor(() => {
      expect(mockCreateRideRequest).toHaveBeenCalled()
    })
  })
})
```

### E2E Testing with Detox
```typescript
// e2e/customer-flow.e2e.js
describe('Customer Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should complete ride booking flow', async () => {
    // Login
    await element(by.id('phone-input')).typeText('+962791234567')
    await element(by.id('send-otp-button')).tap()

    // Enter OTP (mock)
    await element(by.id('otp-input')).typeText('123456')
    await element(by.id('verify-otp-button')).tap()

    // Navigate to ride booking
    await element(by.id('rides-tab')).tap()

    // Select pickup location
    await element(by.id('pickup-input')).tap()
    await element(by.text('Current Location')).tap()

    // Select destination
    await element(by.id('destination-input')).tap()
    await element(by.id('search-input')).typeText('Amman Mall')
    await element(by.text('Amman Mall, Amman')).tap()

    // Book ride
    await element(by.id('book-ride-button')).tap()

    // Verify ride tracking screen
    await expect(element(by.id('ride-tracking-screen'))).toBeVisible()
    await expect(element(by.text('Looking for driver...'))).toBeVisible()
  })

  it('should track ride in real-time', async () => {
    // Assume ride is already booked and driver assigned
    await element(by.id('rides-tab')).tap()

    // Verify tracking elements
    await expect(element(by.id('driver-info-card'))).toBeVisible()
    await expect(element(by.id('ride-map'))).toBeVisible()
    await expect(element(by.id('driver-location-marker'))).toBeVisible()

    // Test driver contact
    await element(by.id('call-driver-button')).tap()
    // Verify call is initiated (mock)
  })
})
```

---

## 🚀 Performance Optimization

### Code Splitting & Lazy Loading
```typescript
// navigation/LazyScreens.tsx
import React, { lazy, Suspense } from 'react'
import { ActivityIndicator, View } from 'react-native'

// Lazy load screens
const RideBookingScreen = lazy(() => import('../screens/customer/RideBookingScreen'))
const RideTrackingScreen = lazy(() => import('../screens/customer/RideTrackingScreen'))
const DriverDashboardScreen = lazy(() => import('../screens/driver/DriverDashboardScreen'))

// Loading component
const ScreenLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#F59E0B" />
  </View>
)

// Wrapper component for lazy screens
export const LazyScreen = ({ component: Component, ...props }: any) => (
  <Suspense fallback={<ScreenLoader />}>
    <Component {...props} />
  </Suspense>
)
```

### Image Optimization
```typescript
// components/ui/OptimizedImage.tsx
interface OptimizedImageProps {
  source: { uri: string } | number
  style?: any
  placeholder?: string
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center'
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholder,
  resizeMode = 'cover',
}) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <View style={style}>
      {loading && (
        <View style={[style, styles.placeholder]}>
          <ActivityIndicator size="small" color="#F59E0B" />
        </View>
      )}

      <FastImage
        source={source}
        style={[style, { opacity: loading ? 0 : 1 }]}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={() => setLoading(true)}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
      />

      {error && placeholder && (
        <Image source={{ uri: placeholder }} style={style} />
      )}
    </View>
  )
}
```

### Memory Management
```typescript
// hooks/useMemoryOptimization.ts
export const useMemoryOptimization = () => {
  useEffect(() => {
    // Clear image cache periodically
    const clearCacheInterval = setInterval(() => {
      FastImage.clearMemoryCache()
    }, 5 * 60 * 1000) // Every 5 minutes

    // Clear disk cache when app goes to background
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background') {
        FastImage.clearDiskCache()
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange)

    return () => {
      clearInterval(clearCacheInterval)
      subscription?.remove()
    }
  }, [])
}
```

### List Performance
```typescript
// components/ui/OptimizedFlatList.tsx
interface OptimizedFlatListProps<T> {
  data: T[]
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement
  keyExtractor: (item: T, index: number) => string
  onEndReached?: () => void
  loading?: boolean
}

function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  loading = false,
}: OptimizedFlatListProps<T>) {
  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  )

  const renderFooter = useCallback(() => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#F59E0B" />
      </View>
    )
  }, [loading])

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  )
}
```

---

## 🔒 Security Implementation

### Secure Storage
```typescript
// utils/SecureStorage.ts
import { MMKV } from 'react-native-mmkv'
import CryptoJS from 'crypto-js'

class SecureStorage {
  private storage = new MMKV({
    id: 'yellowtaxi-secure',
    encryptionKey: 'your-encryption-key',
  })

  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, 'your-secret-key').toString()
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, 'your-secret-key')
    return bytes.toString(CryptoJS.enc.Utf8)
  }

  setItem(key: string, value: string): void {
    const encryptedValue = this.encrypt(value)
    this.storage.set(key, encryptedValue)
  }

  getItem(key: string): string | null {
    const encryptedValue = this.storage.getString(key)
    if (!encryptedValue) return null

    try {
      return this.decrypt(encryptedValue)
    } catch (error) {
      console.error('Failed to decrypt stored value:', error)
      return null
    }
  }

  removeItem(key: string): void {
    this.storage.delete(key)
  }

  clear(): void {
    this.storage.clearAll()
  }
}

export const secureStorage = new SecureStorage()
```

### API Security
```typescript
// utils/ApiSecurity.ts
class ApiSecurity {
  // Request signing
  static signRequest(method: string, url: string, body?: string): string {
    const timestamp = Date.now().toString()
    const nonce = Math.random().toString(36).substring(2, 15)
    const message = `${method}${url}${body || ''}${timestamp}${nonce}`

    return CryptoJS.HmacSHA256(message, 'your-api-secret').toString()
  }

  // Request validation
  static validateResponse(response: any, signature: string): boolean {
    const expectedSignature = CryptoJS.HmacSHA256(
      JSON.stringify(response),
      'your-api-secret'
    ).toString()

    return signature === expectedSignature
  }

  // Certificate pinning
  static async makeSecureRequest(url: string, options: RequestInit = {}) {
    const signature = this.signRequest(
      options.method || 'GET',
      url,
      options.body as string
    )

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'X-Signature': signature,
        'X-Timestamp': Date.now().toString(),
      },
    })
  }
}
```

### Phone Number Validation
```typescript
// utils/PhoneValidation.ts
class PhoneValidation {
  static validatePhoneNumber(phone: string): boolean {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Check if it's a valid Jordanian number
    if (cleaned.startsWith('962')) {
      return cleaned.length === 12 // +962 + 9 digits
    }

    // Check if it's a local number (should be 9 digits)
    return cleaned.length === 9
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')

    // Add country code if not present
    if (!cleaned.startsWith('962')) {
      return `+962${cleaned}`
    }

    return `+${cleaned}`
  }

  static formatDisplayNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('962')) {
      const localNumber = cleaned.substring(3)
      return `+962 ${localNumber.substring(0, 1)} ${localNumber.substring(1, 5)} ${localNumber.substring(5)}`
    }

    return phone
  }

  static isValidOTP(otp: string): boolean {
    return /^\d{6}$/.test(otp)
  }
}
```

---

## 📱 Platform-Specific Features

### iOS Specific Features
```typescript
// utils/IOSFeatures.ts
import { Platform } from 'react-native'
import CallKit from 'react-native-callkit'

class IOSFeatures {
  // CallKit integration for driver calls
  static setupCallKit() {
    if (Platform.OS !== 'ios') return

    CallKit.setup({
      ios: {
        appName: 'YellowTaxi',
        imageName: 'yellowtaxi-logo',
        supportsVideo: false,
        maximumCallGroups: 1,
        maximumCallsPerCallGroup: 1,
      },
    })
  }

  static async startCall(driverInfo: DriverInfo) {
    if (Platform.OS !== 'ios') return

    const callUUID = CallKit.startCall({
      handle: driverInfo.phone,
      handleType: 'phone',
      hasVideo: false,
      localizedCallerName: driverInfo.name,
    })

    return callUUID
  }

  // Siri Shortcuts
  static setupSiriShortcuts() {
    if (Platform.OS !== 'ios') return

    // Add "Book a ride" shortcut
    SiriShortcuts.donateShortcut({
      activityType: 'com.yellowtaxi.book-ride',
      title: 'Book a ride',
      userInfo: {
        action: 'book-ride',
      },
      eligibleForSearch: true,
      eligibleForPrediction: true,
    })
  }

  // Live Activities for ride tracking
  static startLiveActivity(rideInfo: RideInfo) {
    if (Platform.OS !== 'ios') return

    LiveActivities.startActivity({
      activityType: 'RideTrackingActivity',
      attributes: {
        driverName: rideInfo.driver.name,
        pickupAddress: rideInfo.pickup.address,
        destinationAddress: rideInfo.destination.address,
      },
      contentState: {
        status: rideInfo.status,
        estimatedArrival: rideInfo.estimatedArrival,
      },
    })
  }
}
```

### Android Specific Features
```typescript
// utils/AndroidFeatures.ts
import { Platform } from 'react-native'
import BackgroundService from 'react-native-background-service'

class AndroidFeatures {
  // Foreground service for location tracking
  static startLocationService() {
    if (Platform.OS !== 'android') return

    BackgroundService.start({
      taskName: 'LocationTracking',
      taskTitle: 'YellowTaxi - Tracking location',
      taskDesc: 'Tracking your location for ride services',
      taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
      },
    })
  }

  static stopLocationService() {
    if (Platform.OS !== 'android') return

    BackgroundService.stop()
  }

  // Android Auto integration
  static setupAndroidAuto() {
    if (Platform.OS !== 'android') return

    // Register Android Auto service
    AndroidAuto.register({
      appName: 'YellowTaxi',
      packageName: 'com.yellowtaxi.driver',
      activities: [
        {
          name: 'NavigationActivity',
          label: 'Navigate to pickup',
        },
        {
          name: 'RideStatusActivity',
          label: 'Ride status',
        },
      ],
    })
  }

  // Picture-in-Picture for ride tracking
  static enterPictureInPicture() {
    if (Platform.OS !== 'android') return

    PictureInPicture.enter({
      aspectRatio: {
        numerator: 16,
        denominator: 9,
      },
    })
  }
}
```

---

## 🔧 Development Tools & Setup

### Development Environment
```bash
# Prerequisites
node --version  # 18.x or higher
npm --version   # 9.x or higher
react-native --version  # 0.73.x

# iOS Development (macOS only)
xcode-select --install
sudo gem install cocoapods

# Android Development
# Install Android Studio
# Set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### Project Setup
```bash
# Create new React Native project
npx react-native@latest init YellowTaxiMobile --template react-native-template-typescript

# Install dependencies
cd YellowTaxiMobile
npm install

# iOS specific setup
cd ios && pod install && cd ..

# Install additional packages
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux redux-persist
npm install react-native-maps react-native-geolocation-service
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/messaging
npm install react-native-push-notification @react-native-async-storage/async-storage
npm install react-native-mmkv react-native-keychain
npm install react-native-reanimated react-native-gesture-handler
npm install react-native-vector-icons react-native-elements
npm install @stripe/stripe-react-native
npm install react-native-permissions
npm install react-native-background-job
npm install react-native-phone-number-input
npm install socket.io-client

# Development dependencies
npm install --save-dev @testing-library/react-native @testing-library/jest-native
npm install --save-dev detox jest-circus
npm install --save-dev flipper-react-native
npm install --save-dev reactotron-react-native reactotron-redux
```

### Build Configuration
```typescript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@screens': './src/screens',
      '@services': './src/services',
      '@utils': './src/utils',
      '@types': './src/types',
    },
  },
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
```

### Environment Configuration
```typescript
// .env.development
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
GOOGLE_MAPS_API_KEY=your_google_maps_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
API_BASE_URL=http://localhost:3000/api
SOCKET_URL=ws://localhost:3001

// .env.production
FIREBASE_API_KEY=your_production_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_production_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_production_project_id
GOOGLE_MAPS_API_KEY=your_production_google_maps_key
STRIPE_PUBLISHABLE_KEY=your_production_stripe_key
API_BASE_URL=https://api.yellowtaxi.com
SOCKET_URL=wss://ws.yellowtaxi.com
```

---

## 📋 Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Project setup and configuration
- [ ] Basic navigation structure
- [ ] Authentication system implementation
- [ ] Firebase integration
- [ ] Basic UI components library

### Phase 2: Core Features (Weeks 3-6)
- [ ] Customer ride booking interface
- [ ] Driver dashboard and request handling
- [ ] Real-time location services
- [ ] Maps integration with Google Maps
- [ ] Basic push notifications

### Phase 3: Advanced Features (Weeks 7-10)
- [ ] Real-time ride tracking
- [ ] Payment integration (Stripe)
- [ ] In-app messaging system
- [ ] Ride history and receipts
- [ ] Driver earnings tracking

### Phase 4: Polish & Testing (Weeks 11-12)
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Platform-specific features
- [ ] App store preparation

### Phase 5: Deployment (Weeks 13-14)
- [ ] Beta testing with real users
- [ ] Bug fixes and improvements
- [ ] App store submission
- [ ] Production deployment
- [ ] Monitoring and analytics setup

---

## 🎯 Success Metrics

### Technical Metrics
- **App Performance**: 60fps animations, <3s startup time
- **Crash Rate**: <0.1% crash-free sessions
- **API Response Time**: <500ms average response time
- **Battery Usage**: <5% battery drain per hour of active use
- **Memory Usage**: <150MB average memory footprint

### User Experience Metrics
- **Customer Satisfaction**: >4.5 star rating
- **Driver Adoption**: >80% of web drivers using mobile app
- **Ride Completion Rate**: >95% successful ride completions
- **App Retention**: >70% 30-day retention rate
- **Feature Usage**: >90% of users using core features

### Business Metrics
- **Revenue Impact**: 20% increase in ride bookings
- **Operational Efficiency**: 30% reduction in support tickets
- **Market Expansion**: 15% increase in driver signups
- **Cost Reduction**: 25% reduction in development costs vs native apps

---

This comprehensive React Native mobile app architecture document provides a complete blueprint for implementing a dual-interface (customer/driver) mobile application that integrates seamlessly with the existing YellowTaxi web platform. The architecture emphasizes scalability, performance, security, and user experience while maintaining consistency with the existing backend infrastructure.
