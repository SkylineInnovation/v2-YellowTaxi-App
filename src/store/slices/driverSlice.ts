// Driver Redux slice for managing driver state
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Driver, DriverState, DriverRideRequest, RideOrder, DriverStatus } from '../../types/ride';
import { driverService } from '../../services/driverService';
import { locationService } from '../../services/locationService';

const initialState: DriverState = {
  profile: null,
  currentRide: null,
  rideRequests: [],
  rideHistory: [],
  isOnline: false,
  isAvailable: false,
  location: null,
  earnings: {
    today: 0,
    week: 0,
    month: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const initializeDriverProfile = createAsyncThunk(
  'driver/initializeProfile',
  async (driverId: string, { rejectWithValue }) => {
    try {
      let profile = await driverService.getDriverProfile(driverId);
      
      if (!profile) {
        // Create default driver profile
        const defaultProfile: Partial<Driver> = {
          id: driverId,
          name: 'Driver',
          phone: '',
          rating: 5.0,
          totalRides: 0,
          vehicle: {
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'White',
            plateNumber: 'ABC-123',
          },
          location: {
            lat: 31.9454,
            lng: 35.9284,
          },
          status: 'offline',
          isOnline: false,
          isAvailable: false,
        };

        await driverService.createOrUpdateDriverProfile(defaultProfile);
        profile = await driverService.getDriverProfile(driverId);
      }

      const earnings = await driverService.getDriverEarnings(driverId);
      
      return { profile, earnings };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize driver profile');
    }
  }
);

export const updateDriverStatus = createAsyncThunk(
  'driver/updateStatus',
  async ({ driverId, status, isOnline }: { driverId: string; status: DriverStatus; isOnline: boolean }, { rejectWithValue }) => {
    try {
      await driverService.updateDriverStatus(driverId, status, isOnline);
      return { status, isOnline };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update driver status');
    }
  }
);

export const acceptRideRequest = createAsyncThunk(
  'driver/acceptRideRequest',
  async ({ requestId, driverId }: { requestId: string; driverId: string }, { rejectWithValue }) => {
    try {
      await driverService.acceptRideRequest(requestId, driverId);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to accept ride request');
    }
  }
);

export const declineRideRequest = createAsyncThunk(
  'driver/declineRideRequest',
  async ({ requestId, reason }: { requestId: string; reason?: string }, { rejectWithValue }) => {
    try {
      await driverService.declineRideRequest(requestId, reason);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to decline ride request');
    }
  }
);

export const updateRideStatus = createAsyncThunk(
  'driver/updateRideStatus',
  async ({ 
    rideId, 
    driverId, 
    status, 
    location, 
    notes 
  }: { 
    rideId: string; 
    driverId: string; 
    status: string; 
    location?: { lat: number; lng: number }; 
    notes?: string;
  }, { rejectWithValue }) => {
    try {
      await driverService.updateRideStatus(rideId, driverId, status as any, location, notes);
      return { rideId, status };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update ride status');
    }
  }
);

export const startLocationTracking = createAsyncThunk(
  'driver/startLocationTracking',
  async ({ driverId, rideId }: { driverId: string; rideId?: string }, { rejectWithValue }) => {
    try {
      await locationService.startLocationTracking(driverId, 'driver', rideId);
      const location = await locationService.getCurrentLocation();
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start location tracking');
    }
  }
);

export const stopLocationTracking = createAsyncThunk(
  'driver/stopLocationTracking',
  async (_, { rejectWithValue }) => {
    try {
      locationService.stopLocationTracking();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to stop location tracking');
    }
  }
);

export const updateDriverLocation = createAsyncThunk(
  'driver/updateLocation',
  async ({ driverId, location }: { driverId: string; location: { lat: number; lng: number; bearing?: number; speed?: number } }, { rejectWithValue }) => {
    try {
      await driverService.updateDriverLocation(driverId, location);
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update driver location');
    }
  }
);

export const getDriverEarnings = createAsyncThunk(
  'driver/getEarnings',
  async (driverId: string, { rejectWithValue }) => {
    try {
      const earnings = await driverService.getDriverEarnings(driverId);
      return earnings;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get driver earnings');
    }
  }
);

export const getDriverRideHistory = createAsyncThunk(
  'driver/getRideHistory',
  async ({ driverId, limit }: { driverId: string; limit?: number }, { rejectWithValue }) => {
    try {
      const rideHistory = await driverService.getDriverRideHistory(driverId, limit);
      return rideHistory;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get ride history');
    }
  }
);

const driverSlice = createSlice({
  name: 'driver',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRideRequests: (state, action: PayloadAction<DriverRideRequest[]>) => {
      state.rideRequests = action.payload;
    },
    setCurrentRide: (state, action: PayloadAction<RideOrder | null>) => {
      state.currentRide = action.payload;
    },
    updateLocation: (state, action: PayloadAction<{ lat: number; lng: number; bearing?: number }>) => {
      state.location = action.payload;
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      state.isAvailable = action.payload;
    },
    removeRideRequest: (state, action: PayloadAction<string>) => {
      state.rideRequests = state.rideRequests.filter(request => request.id !== action.payload);
    },
    updateDriverProfile: (state, action: PayloadAction<Partial<Driver>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize driver profile
      .addCase(initializeDriverProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeDriverProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.profile;
        state.earnings = action.payload.earnings;
        state.isOnline = action.payload.profile?.isOnline || false;
        state.isAvailable = action.payload.profile?.isAvailable || false;
      })
      .addCase(initializeDriverProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update driver status
      .addCase(updateDriverStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDriverStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isOnline = action.payload.isOnline;
        state.isAvailable = action.payload.isOnline && action.payload.status === 'online';
        if (state.profile) {
          state.profile.status = action.payload.status;
          state.profile.isOnline = action.payload.isOnline;
          state.profile.isAvailable = state.isAvailable;
        }
      })
      .addCase(updateDriverStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Accept ride request
      .addCase(acceptRideRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptRideRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.rideRequests = state.rideRequests.filter(request => request.id !== action.payload);
        state.isAvailable = false;
        if (state.profile) {
          state.profile.status = 'busy';
          state.profile.isAvailable = false;
        }
      })
      .addCase(acceptRideRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Decline ride request
      .addCase(declineRideRequest.fulfilled, (state, action) => {
        state.rideRequests = state.rideRequests.filter(request => request.id !== action.payload);
      })

      // Update ride status
      .addCase(updateRideStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRideStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentRide) {
          state.currentRide.status = action.payload.status as any;
        }
        
        // If ride is completed or cancelled, make driver available again
        if (['completed', 'cancelled'].includes(action.payload.status)) {
          state.isAvailable = true;
          state.currentRide = null;
          if (state.profile) {
            state.profile.status = 'online';
            state.profile.isAvailable = true;
          }
        }
      })
      .addCase(updateRideStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Start location tracking
      .addCase(startLocationTracking.fulfilled, (state, action) => {
        state.location = action.payload;
      })

      // Update driver location
      .addCase(updateDriverLocation.fulfilled, (state, action) => {
        state.location = action.payload;
      })

      // Get driver earnings
      .addCase(getDriverEarnings.fulfilled, (state, action) => {
        state.earnings = action.payload;
      })

      // Get driver ride history
      .addCase(getDriverRideHistory.fulfilled, (state, action) => {
        state.rideHistory = action.payload;
      });
  },
});

export const {
  clearError,
  setRideRequests,
  setCurrentRide,
  updateLocation,
  setOnlineStatus,
  removeRideRequest,
  updateDriverProfile,
} = driverSlice.actions;

// Selectors
export const selectDriverProfile = (state: { driver: DriverState }) => state.driver.profile;
export const selectDriverCurrentRide = (state: { driver: DriverState }) => state.driver.currentRide;
export const selectDriverRideRequests = (state: { driver: DriverState }) => state.driver.rideRequests;
export const selectDriverRideHistory = (state: { driver: DriverState }) => state.driver.rideHistory;
export const selectDriverIsOnline = (state: { driver: DriverState }) => state.driver.isOnline;
export const selectDriverIsAvailable = (state: { driver: DriverState }) => state.driver.isAvailable;
export const selectDriverLocation = (state: { driver: DriverState }) => state.driver.location;
export const selectDriverEarnings = (state: { driver: DriverState }) => state.driver.earnings;
export const selectDriverLoading = (state: { driver: DriverState }) => state.driver.loading;
export const selectDriverError = (state: { driver: DriverState }) => state.driver.error;

export default driverSlice.reducer;
