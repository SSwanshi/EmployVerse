import api from './api';

export const jobsApi = {
  getJobs: async () => {
    const response = await api.get('/recruiter/jobs');
    return response.data;
  },

  addJob: async (jobData) => {
    const response = await api.post('/recruiter/add-job', jobData);
    return response.data;
  },

  getJob: async (id) => {
    const response = await api.get(`/recruiter/edit-job/${id}`);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/recruiter/edit-job/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (jobId) => {
    const response = await api.delete(`/recruiter/delete-job/${jobId}`);
    return response.data;
  },
};

