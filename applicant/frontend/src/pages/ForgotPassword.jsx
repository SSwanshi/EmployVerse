import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { sendOtp, verifyOtp, resetPassword, setEmail, setOtp, resetState } from '../store/slices/forgotPasswordSlice';
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
    <form onSubmit={handleSendOtp} className="space-y-5">
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Email Address
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
          placeholder="name@example.com"
          className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
            emailError
              ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
              : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
          }`}
        />
        {emailError && (
          <p className="mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>
        )}
        <p className="text-[10px] font-semibold text-slate-400 mt-1">
          We will send a 6-digit verification code to your email address
        </p>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-205 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Sending Verification...' : 'Send Verification Code'}
      </button>

      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderOtpStep = () => (
    <form onSubmit={handleVerifyOtp} className="space-y-5">
      <div>
        <p className="text-xs text-slate-500 font-semibold mb-4 leading-relaxed">
          We've sent a 6-digit verification code to <span className="font-bold text-slate-800">{email}</span>
        </p>
        <label
          htmlFor="otp"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Enter Verification Code
        </label>
        <input
          id="otp"
          type="text"
          required
          maxLength={6}
          value={localOtp}
          onChange={(e) => setLocalOtp(e.target.value.replace(/\D/g, ''))}
          placeholder="0 0 0 0 0 0"
          className="w-full rounded-xl border border-slate-200 py-3 px-4 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-slate-800 placeholder:text-slate-300 bg-slate-50"
        />
        <p className="text-[10px] font-semibold text-slate-400 mt-1">
          Code expires in 10 minutes
        </p>
      </div>

      {(error || localError) && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || localOtp.length !== 6}
        className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-205 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Verifying...' : 'Verify Code'}
      </button>

      <div className="text-center space-y-3 mt-4">
        <button
          type="button"
          onClick={() => {
            dispatch(resetState());
            setLocalEmail('');
            setLocalOtp('');
          }}
          className="text-xs text-blue-600 hover:text-blue-700 font-bold block w-full text-center cursor-pointer"
        >
          Use a different email
        </button>
        <div>
          <Link
            to="/login"
            className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </form>
  );

  const renderResetStep = () => (
    <form onSubmit={handleResetPassword} className="space-y-5">
      <div>
        <label
          htmlFor="newPassword"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          New Password
        </label>
        <input
          id="newPassword"
          type="password"
          required
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Enter new password"
          className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50"
        />
        <p className="text-[10px] font-semibold text-slate-400 mt-1">
          Password must be at least 4 characters long
        </p>
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50"
        />
      </div>

      {(error || localError) && (
        <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed">
          {error || localError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !newPassword || !confirmPassword}
        className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-205 disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Resetting Password...' : 'Reset Password'}
      </button>

      <div className="text-center mt-4">
        <Link
          to="/login"
          className="text-xs text-blue-600 hover:text-blue-700 font-bold inline-flex items-center"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="space-y-5 text-center">
      <div className="flex justify-center">
        <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center border border-green-100">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">Password Reset Successful!</h3>
        <p className="text-slate-500 text-xs leading-relaxed font-semibold">
          Your password has been reset successfully. You can now login with your new password.
        </p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5">
        <p className="text-xs text-blue-700 font-bold leading-relaxed">
          Redirecting to login page in a few seconds...
        </p>
      </div>
      <Link
        to="/login"
        className="inline-block w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md text-center transition-all"
      >
        Go to Login
      </Link>
    </div>
  );

  const getStepTitle = () => {
    switch (step) {
      case 'email':
        return 'Reset your password';
      case 'otp':
        return 'Verify your identity';
      case 'reset':
        return 'Choose new password';
      case 'success':
        return 'All done!';
      default:
        return 'Reset your password';
    }
  };

  const getStepSubtitle = () => {
    switch (step) {
      case 'email':
        return 'Enter your email to receive a verification code';
      case 'otp':
        return 'Check your inbox for the 6-digit code';
      case 'reset':
        return 'Create a strong, secure new password';
      case 'success':
        return 'Your password was updated';
      default:
        return 'Enter email to reset password';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6 py-12 font-sans">
      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 md:p-10 transition-all duration-300">
        <div className="text-center mb-8">
          <Link
            to="/"
            className="text-slate-900 text-2xl font-black tracking-tight inline-flex items-center mb-4"
          >
            <span className="text-blue-600">Employ</span>Verse
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {getStepTitle()}
          </h2>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            {getStepSubtitle()}
          </p>
        </div>

        {step === 'email' && renderEmailStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'reset' && renderResetStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  );
};

export default ForgotPassword;
