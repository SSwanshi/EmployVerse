import { configureStore } from '@reduxjs/toolkit';
import pendingVerificationsReducer from './slices/pendingVerificationsSlice';

export const store = configureStore({
  reducer: {
    pendingVerifications: pendingVerificationsReducer,
  },
});

