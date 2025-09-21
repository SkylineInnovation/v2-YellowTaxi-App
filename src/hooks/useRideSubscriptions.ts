import { useEffect } from 'react';
import { useAppDispatch } from '../store';
import {
  setCurrentRide,
  setActiveRequest,
  setRideHistory,
} from '../store/slices/rideSlice';
import { rideService } from '../services/rideService';

export const useRideSubscriptions = (customerId: string | null) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!customerId) return;

    // Subscribe to ride requests
    const unsubscribeRequests = rideService.subscribeToCustomerRideRequests(
      customerId,
      (requests) => {
        // Find the most recent active request
        const activeRequest = requests.find(r => 
          ['pending', 'accepted'].includes(r.status)
        );
        dispatch(setActiveRequest(activeRequest || null));
      }
    );

    // Subscribe to ride orders
    const unsubscribeOrders = rideService.subscribeToCustomerRideOrders(
      customerId,
      (orders) => {
        // Find the current active ride
        const activeRide = orders.find(o => 
          ['pending', 'searching', 'assigned', 'driver_arriving', 'driver_arrived', 'picked_up', 'in_progress'].includes(o.status)
        );
        dispatch(setCurrentRide(activeRide || null));

        // Set ride history (completed and cancelled rides)
        const historyRides = orders.filter(o => 
          ['completed', 'cancelled'].includes(o.status)
        );
        dispatch(setRideHistory(historyRides));
      }
    );

    // Cleanup subscriptions
    return () => {
      unsubscribeRequests();
      unsubscribeOrders();
    };
  }, [customerId, dispatch]);
};
