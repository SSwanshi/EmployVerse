import api from './api';

export const internshipsApi = {
  getInternships: async () => {
    const response = await api.get('/recruiter/internships');
    return response.data;
  },

  addInternship: async (internshipData) => {
    const response = await api.post('/recruiter/add-internship', internshipData);
    return response.data;
  },

  getInternship: async (id) => {
    const response = await api.get(`/recruiter/edit-internship/${id}`);
    return response.data;
  },

  updateInternship: async (id, internshipData) => {
    const response = await api.put(`/recruiter/edit-internship/${id}`, internshipData);
    return response.data;
  },

  deleteInternship: async (internshipId) => {
    const response = await api.delete(`/recruiter/delete-intern/${internshipId}`);
    return response.data;
  },
};

