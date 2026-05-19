import api from './api';

export const paymentApi = {
  getPaymentPage: async () => {
    const response = await api.get('/payment/payment');
    return response.data;
  },

  processPayment: async (paymentData) => {
    const response = await api.post('/payment/process-payment', paymentData);
    return response.data;
  },

  getReceipt: async () => {
    const response = await api.get('/payment/receipt');
    return response.data;
  },

  getSubscription: async () => {
    const response = await api.get('/payment/subscription');
    return response.data;
  },

  getTerms: async () => {
    const response = await api.get('/payment/terms');
    return response.data;
  },

  getPrivacy: async () => {
    const response = await api.get('/payment/privacy');
    return response.data;
  },
};

