import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminApi } from '../../services/adminApi';

export const fetchPendingVerificationsCount = createAsyncThunk(
  'pendingVerifications/fetchCount',
  async () => {
    try {
      const companies = await adminApi.getCompaniesAwaitingVerification();
      return companies.length;
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
      return 0;
    }
  }
);

const pendingVerificationsSlice = createSlice({
  name: 'pendingVerifications',
  initialState: {
    count: 0,
    loading: false,
    error: null,
  },
  reducers: {
    decrementCount: (state) => {
      if (state.count > 0) {
        state.count -= 1;
      }
    },
    resetCount: (state) => {
      state.count = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPendingVerificationsCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingVerificationsCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload;
      })
      .addCase(fetchPendingVerificationsCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { decrementCount, resetCount } = pendingVerificationsSlice.actions;
export default pendingVerificationsSlice.reducer;

