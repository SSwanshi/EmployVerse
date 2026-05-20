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

  // Shine effect styles
  const shineStyle = `
    @keyframes shine {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .shine-effect {
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%);
      background-size: 1000px 100%;
      animation: shine 3s infinite;
    }
  `;

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
        setVerifyMsg(' Premium activated! Welcome to Recruiter Pro.');
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
      <style>{shineStyle}</style>
      <h1 className="text-3xl font-semibold mb-4 text-center">Upgrade to Recruiter Pro</h1>
      <p className="text-gray-600 mb-8 text-center">Choose between the Free plan and Pro to unlock premium features.</p>

      {verifyMsg && (
        <div className={`mb-6 text-center px-4 py-3 rounded font-medium ${verifying ? 'bg-gray-100 text-black' : verifyMsg.includes('activated') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
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
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-black rounded-full" /> 1 job post</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-black rounded-full" /> 1 internship post</li>
            <li className="flex items-center gap-3"><span className="inline-block w-3 h-3 bg-black rounded-full" /> 1 company add</li>
          </ul>

          <div className="mt-6">
            {!user?.isPremium && (
              <Link to="/profile" className="inline-block bg-gray-100 text-black font-semibold px-4 py-2 rounded">Your Plan</Link>
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
        <div className="relative border-2 border-blue-400 rounded-2xl p-8 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden transform hover:scale-105 transition duration-300">
          {/* Shine Effect Overlay */}
          

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-black">Pro</div>
              <div className="text-sm text-gray-600 font-medium">Recruiter Pro</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">₹999</div>
              <span className="text-sm font-medium text-gray-600">/month</span>
            </div>
          </div>

          <ul className="relative z-10 mt-8 text-gray-800 space-y-3">
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="font-medium">Unlimited job posts</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="font-medium">Unlimited internship posts</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="font-medium">Unlimited company add</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full flex-shrink-0">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span className="font-medium">View applicant complete profile</span>
            </li>
          </ul>

          <div className="relative z-10 mt-8">
            {user?.isPremium ? (
              <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg">
                <Check className="h-5 w-5" />
                Current Plan
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
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold px-6 py-3 rounded-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-600 transition duration-200 transform hover:scale-105"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
