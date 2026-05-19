import api from './api';

export const applicationsApi = {
  getJobApplications: async (jobId) => {
    const response = await api.get(`/applications/${jobId}`);
    return response.data;
  },

  selectApplicant: async (jobId, applicantId) => {
    const response = await api.post(`/applications/${jobId}/select/${applicantId}`);
    return response.data;
  },

  rejectApplicant: async (jobId, applicantId) => {
    const response = await api.post(`/applications/${jobId}/reject/${applicantId}`);
    return response.data;
  },

  getInternshipApplications: async (internshipId) => {
    const response = await api.get(`/internapplicants/${internshipId}`);
    return response.data;
  },

  selectInternshipApplicant: async (internshipId, applicantId) => {
    const response = await api.post(`/internapplicants/${internshipId}/select/${applicantId}`);
    return response.data;
  },

  rejectInternshipApplicant: async (internshipId, applicantId) => {
    const response = await api.post(`/internapplicants/${internshipId}/reject/${applicantId}`);
    return response.data;
  },

  getStatistics: async () => {
    const response = await api.get('/recruiter/home/statistics');
    return response.data;
  },
};

