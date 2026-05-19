import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import paymentService from '../../services/paymentService';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ amount, plan, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
      invalid: { color: '#9e2146' },
    },
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    try {
      // 1. Create Payment Intent (Backend)
      const { clientSecret, paymentIntentId } =
        await paymentService.createPaymentIntent(amount, plan);

      // 2. Confirm Card Payment (Stripe handles 2FA here automatically)
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: "Premium User",
            },
          },
          // Required for 3D Secure redirection
          return_url: `${window.location.origin}/payment-success`,
        }
      );

      if (error) {
        showToast(error.message, 'error');
        setProcessing(false);
        return;
      }

      // 3. After OTP / Bank Approval
      if (paymentIntent.status === 'succeeded') {
        const result = await paymentService.processPayment(
          paymentIntentId,
          plan,
          amount
        );

        if (result.success) {
          showToast('Payment successful! You are now a premium member!', 'success');
          if (onSuccess) onSuccess(result);
          setTimeout(() => navigate('/receipt'), 2000);
        }
      }
    } catch (error) {
      console.error('Payment error:', error);
      showToast(error.response?.data?.error || 'Payment failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Details
        </label>
        <div className="bg-white p-4 rounded border border-gray-300">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
          processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {processing ? 'Processing...' : `Pay ₹${amount}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        🔐 Secure payment with Stripe. OTP / Bank verification will appear if required.
      </p>
    </form>
  );
};

export default CheckoutForm;
