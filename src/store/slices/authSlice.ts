import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, UserProfile, PhoneLoginForm, OTPVerificationForm } from '../../types/auth';
import { phoneAuthService } from '../../services/auth';

// Initial state
const initialState: AuthState = {
  user: null,
  userProfile: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  phoneVerification: {
    phoneNumber: null,
    confirmationResult: null,
    loading: false,
    error: null,
  },
};

// Async thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phoneData: PhoneLoginForm, { rejectWithValue }) => {
    try {
      const response = await phoneAuthService.sendOTP(phoneData.phoneNumber);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to send OTP');
      }
      
      return {
        phoneNumber: phoneData.phoneNumber,
        confirmationResult: response.confirmationResult,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (
    { otp, confirmationResult }: { otp: string; confirmationResult: any },
    { rejectWithValue }
  ) => {
    try {
      const response = await phoneAuthService.verifyOTP(confirmationResult, otp);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Failed to verify OTP');
      }
      
      return response.user;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to verify OTP');
    }
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await phoneAuthService.signOut();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to sign out');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    
    setUserProfile: (state, action: PayloadAction<UserProfile | null>) => {
      state.userProfile = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
      state.phoneVerification.error = null;
    },
    
    clearPhoneVerification: (state) => {
      state.phoneVerification = {
        phoneNumber: null,
        confirmationResult: null,
        loading: false,
        error: null,
      };
    },
    
    clearAuth: (state) => {
      state.user = null;
      state.userProfile = null;
      state.isAuthenticated = false;
      state.error = null;
      state.phoneVerification = {
        phoneNumber: null,
        confirmationResult: null,
        loading: false,
        error: null,
      };
    },
  },
  
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOTP.pending, (state) => {
        state.phoneVerification.loading = true;
        state.phoneVerification.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.phoneVerification.loading = false;
        state.phoneVerification.phoneNumber = action.payload.phoneNumber;
        state.phoneVerification.confirmationResult = action.payload.confirmationResult;
        state.phoneVerification.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.phoneVerification.loading = false;
        state.phoneVerification.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        // Clear phone verification state after successful verification
        state.phoneVerification = {
          phoneNumber: null,
          confirmationResult: null,
          loading: false,
          error: null,
        };
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Sign out
    builder
      .addCase(signOut.pending, (state) => {
        state.loading = true;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.userProfile = null;
        state.isAuthenticated = false;
        state.error = null;
        state.phoneVerification = {
          phoneNumber: null,
          confirmationResult: null,
          loading: false,
          error: null,
        };
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUser,
  setUserProfile,
  setLoading,
  setError,
  clearError,
  clearPhoneVerification,
  clearAuth,
} = authSlice.actions;

export default authSlice.reducer;
