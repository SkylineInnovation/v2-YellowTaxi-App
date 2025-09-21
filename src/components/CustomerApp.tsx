import React from 'react';
import { CustomerNavigator } from '../navigation/CustomerNavigator';
import { useAppSelector } from '../store';
import { useRideSubscriptions } from '../hooks/useRideSubscriptions';

export const CustomerApp: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  
  // Set up ride subscriptions for the authenticated user
  useRideSubscriptions(user?.id || null);

  return <CustomerNavigator />;
};
