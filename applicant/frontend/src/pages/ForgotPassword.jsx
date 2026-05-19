import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendOtp, verifyOtp, resetPassword, setEmail, setOtp, resetState } from '../store/slices/forgotPasswordSlice';
import signupImg from '../assets/images/header_image.webp';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { validateEmail } from '../utils/emailValidation';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { email, otp, step, loading, error } = useAppSelector((state) => state.forgotPassword);

  const [localEmail, setLocalEmail] = useState('');
  const [localOtp, setLocalOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    // Reset state when component unmounts
    return () => {
      dispatch(resetState());
    };
  }, [dispatch]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!localEmail) {
      setLocalError('Please enter your email address');
      return;
    }

    dispatch(setEmail(localEmail));
    await dispatch(sendOtp(localEmail));
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!localOtp || localOtp.length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP');
      return;
    }

    dispatch(setOtp(localOtp));
    await dispatch(verifyOtp({ email, otp: localOtp }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!newPassword || newPassword.length < 4) {
      setLocalError('Password must be at least 4 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    const result = await dispatch(resetPassword({ email, otp, newPassword }));
    if (resetPassword.fulfilled.match(result)) {
      // Success - redirect to login after 3 seconds
      setTimeout(() => {
        dispatch(resetState());
        navigate('/login');
      }, 3000);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleSendOtp} className="space-y-6">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-blue-800 mb-2"
        >
          Email Address <span className="text-yellow-500">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          value={localEmail}
          onChange={(e) => {
            setLocalEmail(e.target.value);
            setEmailError("");
          }}
          onBlur={(e) => {
            const error = validateEmail(e.target.value);
            setEmailError(error);
          }}
          placeholder="Enter your registered email"
          className={`w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${
            emailError
              ? "border-red-500 focus:ring-red-500"
              : "border-blue-300 focus:ring-blue-500"
          }`}
        />
        {emailError && (
          <p className="mt-1 text-sm text-red-600">{emailError}</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          We'll send a 6-digit OTP to your email address
        </p>
      </div>

      {(error || localError) && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded text-center text-sm">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Sending OTP...' : 'Send OTP'}
      </button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      <div>
        <p className="text-sm text-gray-700 mb-4">
          We've sent a 6-digit OTP to <span className="font-semibold text-blue-800">{email}</span>
        </p>
        <label
          htmlFor="otp"
          className="block text-sm font-semibold text-blue-800 mb-2"
        >
          Enter OTP <span className="text-yellow-500">*</span>
        </label>
        <input
          id="otp"
          type="text"
          required
          maxLength={6}
          value={localOtp}
          onChange={(e) => setLocalOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full rounded-md border border-blue-300 p-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-600 mt-1">
          OTP expires in 10 minutes
        </p>
      </div>

      {(error || localError) && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded text-center text-sm">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || localOtp.length !== 6}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => {
            dispatch(resetState());
            setLocalEmail('');
            setLocalOtp('');
          }}
          className="text-sm text-blue-600 hover:text-blue-500 font-medium"
        >
          Use a different email
        </button>
        <div>
          <Link
            to="/login"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium inline-flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div>
        <label
          htmlFor="newPassword"
          className="block text-sm font-semibold text-blue-800 mb-2"
        >
          New Password <span className="text-yellow-500">*</span>
        </label>
        <input
          id="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full rounded-md border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-600 mt-1">
          Password must be at least 4 characters long
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-semibold text-blue-800 mb-2"
        >
          Confirm Password <span className="text-yellow-500">*</span>
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-md border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {(error || localError) && (
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded text-center text-sm">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-blue-600 hover:text-blue-500 font-medium inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl font-bold text-blue-800 mb-2">Password Reset Successful!</h3>
        <p className="text-gray-700">
          Your password has been reset successfully. You can now login with your new password.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <p className="text-sm text-blue-800">
          Redirecting to login page in a few seconds...
        </p>
      </div>
      <Link
        to="/login"
        className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Go to Login
      </Link>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Forgot Password';
      case 'otp':
        return 'Verify OTP';
      case 'reset':
        return 'Reset Password';
      case 'success':
        return 'Success';
      default:
        return 'Forgot Password';
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-poppins relative"
      style={{
        backgroundImage: `url(${signupImg})`,
        height: '100vh',
      }}
    >
      {/* Blue overlay for readability */}
      <div className="absolute inset-0 bg-blue-900/60"></div>

      <div className="relative w-11/12 max-w-md bg-white/90 rounded-xl shadow-lg p-8 md:p-10">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
          {getStepTitle()}
        </h2>
        <p className="text-center text-yellow-500 font-medium mb-6">
          {step === 'email' && 'Enter your email to receive OTP'}
          {step === 'otp' && 'Check your email for the OTP'}
          {step === 'reset' && 'Create a new password'}
          {step === 'success' && 'All done!'}
        </p>

        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'reset' && renderResetStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;

