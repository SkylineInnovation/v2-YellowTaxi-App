import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthStackParamList } from './types';
import {
  PhoneLoginScreen,
  OTPVerificationScreen,
  RoleSelectionScreen,
  ProfileSetupScreen,
} from '../screens/auth';
import { LanguageSelectionScreen } from '../screens/LanguageSelectionScreen';
import { useLanguage } from '../contexts/LanguageContext';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  const { isLanguageSelected } = useLanguage();

  return (
    <Stack.Navigator
      initialRouteName={isLanguageSelected ? "PhoneLogin" : "LanguageSelection"}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="LanguageSelection" 
        component={LanguageSelectionScreen}
        options={{
          title: 'Select Language',
          gestureEnabled: false, // Prevent going back from language selection
        }}
      />
      <Stack.Screen 
        name="PhoneLogin" 
        component={PhoneLoginScreen}
        options={{
          title: 'Phone Login',
        }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen}
        options={{
          title: 'Verify Phone',
          gestureEnabled: false, // Prevent going back during OTP verification
        }}
      />
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{
          title: 'Select Role',
          gestureEnabled: false, // Prevent going back after successful verification
        }}
      />
      <Stack.Screen 
        name="ProfileSetup" 
        component={ProfileSetupScreen}
        options={{
          title: 'Complete Profile',
        }}
      />
    </Stack.Navigator>
  );
};
