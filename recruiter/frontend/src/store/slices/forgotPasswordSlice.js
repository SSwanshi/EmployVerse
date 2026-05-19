import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi } from '../../services/authApi';

// Async thunks
export const sendOtp = createAsyncThunk(
  'forgotPassword/sendOtp',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authApi.sendForgotPasswordOtp(email);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to send OTP. Please try again.'
      );
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'forgotPassword/verifyOtp',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const response = await authApi.verifyOtp(email, otp);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Invalid OTP. Please try again.'
      );
    }
  }
);

export const resetPassword = createAsyncThunk(
  'forgotPassword/resetPassword',
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(email, otp, newPassword);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to reset password. Please try again.'
      );
    }
  }
);

const initialState = {
  email: '',
  otp: '',
  step: 'email', // 'email', 'otp', 'reset', 'success'
  loading: false,
  error: null,
  otpVerified: false,
};

const forgotPasswordSlice = createSlice({
  name: 'forgotPassword',
  initialState,
  reducers: {
    setEmail: (state, action) => {
      state.email = action.payload;
      state.error = null;
    },
    setOtp: (state, action) => {
      state.otp = action.payload;
      state.error = null;
    },
    setStep: (state, action) => {
      state.step = action.payload;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetState: (state) => {
      state.email = '';
      state.otp = '';
      state.step = 'email';
      state.loading = false;
      state.error = null;
      state.otpVerified = false;
    },
  },
  extraReducers: (builder) => {
    // Send OTP
    builder
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 'otp';
        state.error = null;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Verify OTP
    builder
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.otpVerified = true;
        state.step = 'reset';
        state.error = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Reset Password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.step = 'success';
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setEmail, setOtp, setStep, clearError, resetState } = forgotPasswordSlice.actions;
export default forgotPasswordSlice.reducer;

