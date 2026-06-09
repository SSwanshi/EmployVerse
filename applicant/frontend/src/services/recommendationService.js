import api from './api';

const recommendationService = {
  getJobRecommendations: async () => {
    const response = await api.get('/recommendations/jobs');
    return response.data;
  },

  getInternshipRecommendations: async () => {
    const response = await api.get('/recommendations/internships');
    return response.data;
  }
};

export default recommendationService;
