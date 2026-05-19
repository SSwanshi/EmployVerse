import api from './api';

export const companiesApi = {
  getCompanies: async () => {
    const response = await api.get('/recruiter/companies');
    return response.data; 
  },

  addCompany: async (formData) => {
    const response = await api.post('/recruiter/add-company', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCompany: async (id) => {
    const response = await api.get(`/recruiter/edit-company/${id}`);
    return response.data;
  },

  updateCompany: async (id, formData) => {
    const response = await api.post(`/recruiter/edit-company/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteCompany: async (companyId) => {
    const response = await api.delete(`/recruiter/delete-company/${companyId}`);
    return response.data;
  },
};

