import api from './api';

export const authApi = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  verify2FA: async (email, otp) => {
    const response = await api.post('/auth/verify-2fa', { email, otp });
    return response.data;
  },

  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  checkSession: async () => {
    const response = await api.get('/auth/check-session');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/user/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/user/profile', profileData);
    return response.data;
  },

  uploadProfileImage: async (formData) => {
    const response = await api.post('/auth/user/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getProfileImage: (userId) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
    return `${API_BASE}/api/auth/profile-image/${userId}`;
  },

  sendForgotPasswordOtp: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  verifyOtp: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  resetPassword: async (email, otp, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  },

  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  },
};

