import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { RootStackParamList } from './types';
import { AuthNavigator } from './AuthNavigator';
import { SplashScreen } from '../screens/SplashScreen';
import { useAppDispatch, useAppSelector } from '../store';
import { setUser } from '../store/slices/authSlice';
import { phoneAuthService } from '../services/auth';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated
        const currentUser = phoneAuthService.getCurrentUser();
        if (currentUser) {
          dispatch(setUser(currentUser));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const unsubscribe = phoneAuthService.onAuthStateChanged((user) => {
      dispatch(setUser(user));
      if (!isLoading) {
        // Only update loading state if we're not in initial loading
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [dispatch, isLoading]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {isAuthenticated && user ? (
          // User is authenticated - show main app
          // For now, we'll just show a placeholder since we haven't built the main app yet
          <Stack.Screen name="App" component={PlaceholderMainApp} />
        ) : (
          // User is not authenticated - show auth flow
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Placeholder component for the main app
// In a real implementation, this would be the main app navigator
const PlaceholderMainApp: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = async () => {
    try {
      await phoneAuthService.signOut();
      dispatch(setUser(null));
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SplashScreen />
  );
};
