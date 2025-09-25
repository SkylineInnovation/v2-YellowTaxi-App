import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CustomerTabParamList } from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RideBookingScreen, RideTrackingScreen } from '../screens/ride';
import EnhancedRideBookingScreen from '../screens/ride/EnhancedRideBookingScreen';
import SimpleRideBookingScreen from '../screens/ride/SimpleRideBookingScreen';
import EnhancedRideTrackingScreen from '../screens/ride/EnhancedRideTrackingScreen';
import DriverDashboardScreen from '../screens/driver/DriverDashboardScreen';
import { colors } from '../theme';

const Stack = createStackNavigator<CustomerTabParamList>();

export const CustomerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
          shadowColor: colors.gray[200],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: 3,
        },
        headerTintColor: colors.gray[900],
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitle: '',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="RideBooking"
        component={WelcomeScreen}
        options={{
          title: 'YellowTaxi',
          headerShown: false, // WelcomeScreen has its own header
        }}
      />
      <Stack.Screen
        name="BookRide"
        component={RideBookingScreen}
        options={{
          title: 'Book a Ride',
        }}
      />
      <Stack.Screen
        name="EnhancedRideBooking"
        component={SimpleRideBookingScreen}
        options={{
          title: 'Book Your Ride',
        }}
      />
      <Stack.Screen
        name="RideTracking"
        component={RideTrackingScreen}
        options={{
          title: 'Track Your Ride',
          headerLeft: () => null, // Prevent going back during active ride
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="EnhancedRideTracking"
        component={EnhancedRideTrackingScreen}
        options={{
          title: 'Track Your Ride',
          headerLeft: () => null,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="DriverDashboard"
        component={DriverDashboardScreen}
        options={{
          title: 'Driver Dashboard',
        }}
      />
      <Stack.Screen
        name="RideHistory"
        component={WelcomeScreen} // Placeholder for ride history
        options={{
          title: 'Ride History',
        }}
      />
      <Stack.Screen 
        name="Profile" 
        component={WelcomeScreen} // Placeholder for now
        options={{
          title: 'Profile',
        }}
      />
    </Stack.Navigator>
  );
};
