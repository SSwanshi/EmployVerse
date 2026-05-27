import api from "./api";

export const adminApi = {
  // Applicants
  getApplicants: async () => {
    const response = await api.get("/api/applicants");
    return response.data;
  },

  deleteApplicant: async (id) => {
    const response = await api.delete(`/api/applicants/${id}`);
    return response.data;
  },

  // Recruiters
  getRecruiters: async () => {
    const response = await api.get("/api/recruiters");
    return response.data;
  },

  deleteRecruiter: async (id) => {
    const response = await api.delete(`/api/recruiters/${id}`);
    return response.data;
  },

  // Companies
  getCompanies: async () => {
    const response = await api.get("/api/companies");
    return response.data;
  },

  getCompaniesAwaitingVerification: async () => {
    const response = await api.get("/api/companies/awaiting-verification");
    return response.data;
  },

  verifyCompany: async (id) => {
    const response = await api.post(`/api/companies/verify/${id}`);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/api/companies/${id}`);
    return response.data;
  },

  // Jobs
  getJobs: async () => {
    const response = await api.get("/api/jobs");
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/api/jobs/${id}`);
    return response.data;
  },

  // Internships
  getInternships: async () => {
    const response = await api.get("/api/internships");
    return response.data;
  },

  deleteInternship: async (id) => {
    const response = await api.delete(`/api/internships/${id}`);
    return response.data;
  },

  // Premium Users
  getPremiumUsers: async () => {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
  <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
    <soap:Body>
      <GetPremiumUsers xmlns="http://example.com/premiumusers" />
    </soap:Body>
  </soap:Envelope>`;

    const baseUrl = import.meta.env.VITE_API_BASE || "";
    const response = await fetch(`${baseUrl}/wsdl`, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml;charset=UTF-8",
        SOAPAction: "GetPremiumUsers",
      },
      body: soapBody,
    });

    const xmlText = await response.text();
    const xmlDoc = new DOMParser().parseFromString(xmlText, "text/xml");

    const users = [...xmlDoc.getElementsByTagName("users")].map((u) => ({
      email: u.getElementsByTagName("email")[0]?.textContent,
      firstName: u.getElementsByTagName("firstName")[0]?.textContent,
      lastName: u.getElementsByTagName("lastName")[0]?.textContent,
      memberSince: u.getElementsByTagName("memberSince")[0]?.textContent,
      status: u.getElementsByTagName("status")[0]?.textContent,
    }));

    return users;
  },

  // Proof Document
  getProofDocumentUrl: (proofId) => {
    const baseUrl = import.meta.env.VITE_API_BASE || "";
    return `${baseUrl}/api/admin/company/proof/${proofId}`;
  },

  getProofDocument: async (proofId) => {
    const response = await api.get(`/api/admin/company/proof/${proofId}`, {
      responseType: "blob",
    });
    return response.data;
  },
};

export default adminApi;
