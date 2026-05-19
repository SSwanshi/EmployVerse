import apiClient from './api';

/**
 * Profile Service - Handles all profile-related API calls
 */
const profileService = {
  /**
   * Get user profile data
   */
  getProfile: async () => {
    try {
      const response = await apiClient.get('/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  /**
   * Delete user account
   */
  deleteAccount: async () => {
    try {
      const response = await apiClient.delete('/profile');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  /**
   * Upload profile image
   */
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profileImage', imageFile);

      // The request interceptor in api.js will handle removing Content-Type for FormData
      const response = await apiClient.post('/profile/image', formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  },

  /**
   * Get profile image
   */
  getProfileImage: async () => {
    try {
      const response = await apiClient.get('/profile/image', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching profile image:', error);
      throw error;
    }
  },

  /**
   * Delete profile image
   */
  deleteProfileImage: async () => {
    try {
      const response = await apiClient.delete('/profile/image', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting profile image:', error);
      throw error;
    }
  },

  /**
   * Get profile image URL
   */
  getProfileImageUrl: (timestamp = Date.now()) => {
    return `${apiClient.defaults.baseURL}/profile/image?t=${timestamp}`;
  },

  /**
   * Upload resume
   */
  uploadResume: async (resumeFile) => {
    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);

      // The request interceptor in api.js will handle removing Content-Type for FormData
      const response = await apiClient.post('/profile/resume', formData, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  },

  /**
   * Get resume
   */
  getResume: async () => {
    try {
      const response = await apiClient.get('/profile/resume', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching resume:', error);
      throw error;
    }
  },

  /**
   * Delete resume
   */
  deleteResume: async () => {
    try {
      const response = await apiClient.delete('/profile/resume', {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw error;
    }
  },

  /**
   * Get resume URL
   */
  getResumeUrl: () => {
    return `${apiClient.defaults.baseURL}/profile/resume`;
  },
};

export default profileService;
