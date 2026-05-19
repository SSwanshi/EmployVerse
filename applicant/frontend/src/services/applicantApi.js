import api from './api';

export const applicantApi = {
  getJobs: async (query) => {
    let endpoint;
    if (query) endpoint = `/applicant/jobs?${query}`
    else endpoint = `/applicant/jobs`
    const response = await api.get(endpoint);
    return response.data;
  },

  getInternships: async (query) => {
    let endpoint;
    if (query) endpoint = `/applicant/internships?${query}`
    else endpoint = `applicant/internships`
    const response = await api.get(endpoint);
    console.log(response.data);
    return response.data;
  },

  getCompanies: async () => {
    const response = await api.get('/applicant/companies');
    return response.data;
  },

  getJobById: async (jobId) => {
    const response = await api.get(`/applicant/jobs/${jobId}`);
    return response.data;
  },

  getInternshipById: async (internshipId) => {
    const response = await api.get(`/applicant/internships/${internshipId}`);
    return response.data;
  },

  applyForJob: async (jobId, resumeId = null) => {
    const body = resumeId ? { resumeId } : {};
    const response = await api.post(`/applicant/jobs/${jobId}/apply`, body);
    return response.data;
  },

  uploadJobApplicationResume: async (jobId, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post(`/applicant/jobs/${jobId}/apply/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  checkInternshipApplication: async (internshipId) => {
    const response = await api.get(`/applicant/internships/${internshipId}/apply`);
    return response.data;
  },

  applyForInternship: async (internshipId, resumeId = null) => {
    const body = resumeId ? { resumeId } : {};
    const response = await api.post(`/applicant/internships/${internshipId}/apply`, body);
    return response.data;
  },

  uploadInternshipApplicationResume: async (internshipId, file) => {
    const formData = new FormData();
    formData.append('resume', file);
    const response = await api.post(`/applicant/internships/${internshipId}/apply/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAppliedJobs: async () => {
    const response = await api.get('/applicant/applied-jobs');
    return response.data;
  },

  getAppliedInternships: async () => {
    const response = await api.get('/applicant/applied-internships');
    return response.data;
  },

  filterJobs: async (filters) => {
    const response = await api.post('/applicant/jobs/filter', filters);
    return response.data;
  },

  filterInternships: async (filters) => {
    const response = await api.post('/applicant/internships/filter', filters);
    return response.data;
  },

  getLogo: (logoId) => {
    const API_BASE = import.meta.env.VITE_API_BASE || 'https://gohire-applicant.onrender.com';
    return `${API_BASE}/api/applicant/logo/${logoId}`;
  },

  getDashboardStats: async () => {
    const response = await api.get('/applicant/dashboard/stats');
    return response.data;
  },
};

