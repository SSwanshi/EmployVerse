import api from './api';

const paymentService = {
  createPaymentIntent: async (amount, plan) => {
    const response = await api.post('/payment/create-payment-intent', { amount, plan });
    return response.data;
  },

  processPayment: async (paymentIntentId, plan, amount) => {
    const response = await api.post('/payment/process-payment', { paymentIntentId, plan, amount });
    return response.data;
  },

  getReceipt: async () => {
    const response = await api.get('/payment/receipt');
    return response.data;
  }
};

export default paymentService;
