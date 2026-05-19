import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getStoredToken } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Check } from 'lucide-react';

const Upgrade = () => {
  const { user, checkAuth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');

  // After Stripe redirect, verify the session and activate premium
  useEffect(() => {
    const checkout = searchParams.get('checkout');
    const sessionId = searchParams.get('session_id');

    if (checkout === 'success' && sessionId) {
      // Clean up URL params immediately so we don't re-verify on refresh
      setSearchParams({}, { replace: true });
      verifySession(sessionId);
    } else if (checkout === 'cancel') {
      setSearchParams({}, { replace: true });
      setVerifyMsg('Payment was cancelled.');
    }
  }, []);

  const verifySession = async (sessionId) => {
    setVerifying(true);
    setVerifyMsg('Verifying your payment...');
    try {
      const token = getStoredToken();
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://gohire-recruiter.onrender.com'}/api/upgrade/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ session_id: sessionId })
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMsg('🎉 Premium activated! Welcome to Recruiter Pro.');
        // Refresh auth context so isPremium updates everywhere
        await checkAuth();
      } else {
        setVerifyMsg(data.message || 'Verification failed. Please contact support.');
      }
    } catch (err) {
      console.error('Verify session error:', err);
      setVerifyMsg('Verification failed. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4 text-center">Upgrade to Recruiter Pro</h1>
      <p className="text-gray-600 mb-8 text-center">Choose between the Free plan and Pro to unlock premium features.</p>

      {verifyMsg && (
        <div className={`mb-6 text-center px-4 py-3 rounded font-medium ${verifying ? 'bg-blue-50 text-blue-700' : verifyMsg.includes('activated') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {verifying && <span className="animate-spin inline-block mr-2">⏳</span>}
          {verifyMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Card */}
        <div className="border rounded-lg p-6 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">Free</div>
              <div className="text-sm text-gray-500">Basic plan</div>
            </div>
            <div className="text-2xl font-extrabold text-gray-800">Free</div>
          </div>

          <ul className="mt-6 text-gray-700 space-y-2">
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-blue-600 rounded-full" /> 1 job post</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-blue-600 rounded-full" /> 1 internship post</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-blue-600 rounded-full" /> 1 company add</li>
          </ul>

          <div className="mt-6">
            {!user?.isPremium && (
              <Link to="/profile" className="inline-block bg-blue-100 text-blue-800 font-semibold px-4 py-2 rounded">Your Plan</Link>
            )}
            {user?.isPremium && (
              <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 font-semibold px-3 py-1 rounded">
                <Check className="h-4 w-4 text-green-600" />
                Active on Pro
              </span>
            )}
          </div>
        </div>

        {/* Pro Card */}
        <div className="border rounded-lg p-6 shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-bold">Pro</div>
              <div className="text-sm text-gray-300">Recruiter Pro</div>
            </div>
            <div className="text-3xl font-extrabold">₹999<span className="text-sm font-medium">/month</span></div>
          </div>

          <ul className="mt-6 text-gray-200 space-y-2">
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" /> Unlimited job posts</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" /> Unlimited internship posts</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" /> Unlimited company add</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" /> View applicant complete profile</li>
          </ul>

          <div className="mt-6">
            {user?.isPremium ? (
              <span className="inline-flex items-center gap-2 bg-yellow-400 text-black font-semibold px-4 py-2 rounded">
                <Check className="h-4 w-4" />
                Your Plan
              </span>
            ) : (
              <button
                onClick={async () => {
                  try {
                    const token = getStoredToken();
                    const res = await fetch(`${import.meta.env.VITE_API_BASE || 'https://gohire-recruiter.onrender.com'}/api/upgrade/create-checkout-session`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                      },
                      body: JSON.stringify({ plan: 'pro_monthly' })
                    });
                    const data = await res.json();
                    if (data && data.url) {
                      window.location.href = data.url;
                    } else {
                      alert(data.message || 'Failed to create checkout session');
                    }
                  } catch (err) {
                    console.error('Checkout error', err);
                    alert('Failed to initiate checkout.');
                  }
                }}
                className="inline-block bg-yellow-400 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300"
              >
                Choose Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
