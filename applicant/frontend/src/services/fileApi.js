import api from './api';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://gohire-applicant.onrender.com';

export const fileApi = {
  getResume: () => {
    return `${API_BASE}/api/files/resume`;
  },

  getProfileImage: () => {
    return `${API_BASE}/api/files/profile-image`;
  },
};

