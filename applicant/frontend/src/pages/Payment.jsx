import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import CheckoutForm from '../components/payment/CheckoutForm';

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  'pk_test_51SJVQ6FpsKIMQNF9NmhUaef64T9JNqzzLXZu5xsIqftppizhIFT7c1BvXLhpsunqniMjWQpWaty7W3W31p0XAf7B00k00a3rDj'
);

const Payment = () => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const plans = {
    monthly: {
      name: 'Monthly Premium',
      price: '299',
      duration: '/ month',
      features: [
        'Unlimited job applications',
        'Priority support',
        'Resume builder access',
        'Application tracking',
        'Email notifications',
      ],
    },
    annual: {
      name: 'Annual Premium',
      price: '2999',
      duration: '/ year',
      features: [
        'All monthly features',
        'Save 16% compared to monthly',
        'Premium badge on profile',
        'Early access to new features',
        'Dedicated account manager',
      ],
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Premium Plan
          </h1>
          <p className="text-lg text-gray-600">
            Unlock exclusive features and boost your job search
          </p>
        </div>

        {/* Plan Selection */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              className={`cursor-pointer rounded-2xl p-8 transition-all ${
                selectedPlan === key
                  ? 'bg-blue-600 text-white shadow-2xl scale-105'
                  : 'bg-white text-gray-900 shadow-lg hover:shadow-xl'
              }`}
            >
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-extrabold">₹{plan.price}</span>
                  <span
                    className={`ml-2 ${
                      selectedPlan === key ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    {plan.duration}
                  </span>
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className={`h-5 w-5 mr-3 ${
                        selectedPlan === key ? 'text-blue-200' : 'text-blue-600'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Payment Details
            </h2>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Selected Plan:</span>
                <span className="text-blue-600 font-bold">
                  {plans[selectedPlan].name}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-700 font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{plans[selectedPlan].price}
                </span>
              </div>
            </div>

            {/* 🔐 Two-Factor Authentication enabled via Stripe (3D Secure) */}
            <Elements
              stripe={stripePromise}
              options={{
                mode: 'payment',
                amount: Number(plans[selectedPlan].price) * 100, // in paise
                currency: 'inr',
              }}
            >
              <CheckoutForm
                amount={plans[selectedPlan].price}
                plan={selectedPlan}
              />
            </Elements>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              Secure payment powered by{' '}
              <span className="font-semibold text-blue-600">Stripe</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
