import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  RideState,
  RideOrder,
  RideRequest,
  CreateRideRequestData,
  NearbyDriver,
  RideEstimate,
  Location,
} from '../../types/ride';
import { rideService } from '../../services/rideService';

// Initial state
const initialState: RideState = {
  currentRide: null,
  rideHistory: [],
  activeRequest: null,
  nearbyDrivers: [],
  rideEstimates: [],
  loading: false,
  error: null,
  trackingEnabled: false,
};

// Async thunks
export const createRideRequest = createAsyncThunk(
  'ride/createRideRequest',
  async (requestData: CreateRideRequestData, { rejectWithValue }) => {
    try {
      const requestId = await rideService.createRideRequest(requestData);
      return requestId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to create ride request');
    }
  }
);

export const cancelRideRequest = createAsyncThunk(
  'ride/cancelRideRequest',
  async ({ requestId, reason }: { requestId: string; reason?: string }, { rejectWithValue }) => {
    try {
      await rideService.cancelRideRequest(requestId, reason);
      return requestId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to cancel ride request');
    }
  }
);

export const fetchNearbyDrivers = createAsyncThunk(
  'ride/fetchNearbyDrivers',
  async (location: Location, { rejectWithValue }) => {
    try {
      const drivers = await rideService.getNearbyDrivers(location);
      return drivers;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch nearby drivers');
    }
  }
);

export const fetchRideEstimates = createAsyncThunk(
  'ride/fetchRideEstimates',
  async ({ pickup, destination }: { pickup: Location; destination: Location }, { rejectWithValue }) => {
    try {
      const estimates = await rideService.getRideEstimates(pickup, destination);
      return estimates;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch ride estimates');
    }
  }
);

// Slice
const rideSlice = createSlice({
  name: 'ride',
  initialState,
  reducers: {
    // Set current ride (from real-time subscription)
    setCurrentRide: (state, action: PayloadAction<RideOrder | null>) => {
      state.currentRide = action.payload;
      if (action.payload) {
        // If ride is completed or cancelled, move to history
        if (['completed', 'cancelled'].includes(action.payload.status)) {
          const existingIndex = state.rideHistory.findIndex(r => r.id === action.payload!.id);
          if (existingIndex === -1) {
            state.rideHistory.unshift(action.payload);
          } else {
            state.rideHistory[existingIndex] = action.payload;
          }
          state.currentRide = null;
        }
      }
    },

    // Set active ride request (from real-time subscription)
    setActiveRequest: (state, action: PayloadAction<RideRequest | null>) => {
      state.activeRequest = action.payload;
    },

    // Update ride history
    setRideHistory: (state, action: PayloadAction<RideOrder[]>) => {
      state.rideHistory = action.payload;
    },

    // Update nearby drivers
    setNearbyDrivers: (state, action: PayloadAction<NearbyDriver[]>) => {
      state.nearbyDrivers = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Toggle tracking
    toggleTracking: (state) => {
      state.trackingEnabled = !state.trackingEnabled;
    },

    // Reset ride state (for logout)
    resetRideState: (state) => {
      return initialState;
    },

    // Update driver location in current ride
    updateDriverLocation: (state, action: PayloadAction<{ lat: number; lng: number; bearing?: number }>) => {
      if (state.currentRide?.driver) {
        state.currentRide.driver.location = action.payload;
        if (action.payload.bearing !== undefined) {
          state.currentRide.driver.bearing = action.payload.bearing;
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Create ride request
    builder
      .addCase(createRideRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRideRequest.fulfilled, (state, action) => {
        state.loading = false;
        // The actual request will be set via real-time subscription
      })
      .addCase(createRideRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Cancel ride request
    builder
      .addCase(cancelRideRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRideRequest.fulfilled, (state, action) => {
        state.loading = false;
        // The request status will be updated via real-time subscription
      })
      .addCase(cancelRideRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch nearby drivers
    builder
      .addCase(fetchNearbyDrivers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNearbyDrivers.fulfilled, (state, action) => {
        state.loading = false;
        state.nearbyDrivers = action.payload;
      })
      .addCase(fetchNearbyDrivers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.nearbyDrivers = [];
      });

    // Fetch ride estimates
    builder
      .addCase(fetchRideEstimates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRideEstimates.fulfilled, (state, action) => {
        state.loading = false;
        state.rideEstimates = action.payload;
      })
      .addCase(fetchRideEstimates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.rideEstimates = [];
      });
  },
});

export const {
  setCurrentRide,
  setActiveRequest,
  setRideHistory,
  setNearbyDrivers,
  clearError,
  toggleTracking,
  resetRideState,
  updateDriverLocation,
} = rideSlice.actions;

export default rideSlice.reducer;

// Selectors
export const selectCurrentRide = (state: { ride: RideState }) => state.ride.currentRide;
export const selectActiveRequest = (state: { ride: RideState }) => state.ride.activeRequest;
export const selectRideHistory = (state: { ride: RideState }) => state.ride.rideHistory;
export const selectNearbyDrivers = (state: { ride: RideState }) => state.ride.nearbyDrivers;
export const selectRideEstimates = (state: { ride: RideState }) => state.ride.rideEstimates;
export const selectRideLoading = (state: { ride: RideState }) => state.ride.loading;
export const selectRideError = (state: { ride: RideState }) => state.ride.error;
export const selectTrackingEnabled = (state: { ride: RideState }) => state.ride.trackingEnabled;

// Computed selectors
export const selectHasActiveRide = (state: { ride: RideState }) => 
  state.ride.currentRide !== null || state.ride.activeRequest !== null;

export const selectCanBookRide = (state: { ride: RideState }) => 
  state.ride.currentRide === null && state.ride.activeRequest === null && !state.ride.loading;
