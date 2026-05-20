import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateEmail } from "../utils/emailValidation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const { login, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await login(email, password);
      if (response && response.success) {
        if (response.require2FA) {
          setShow2FA(true);
          setMessage(response.message || "Please enter the OTP sent to your email.");
        } else {
          navigate("/");
        }
      } else {
        setError(response?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = "Login failed. Please try again.";

      // Check for network errors
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error') || err.message?.includes('connect to server')) {
        errorMessage = "Cannot connect to server. Please ensure the backend server is running.";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await verify2FA(email, otp);
      if (response && response.success) {
        navigate("/");
      } else {
        setError(response?.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-sans">
      {/* Left side: Premium Branding Panel */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-16 relative overflow-hidden">
        {/* Backdrop Glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>

        <div>
          <Link to="/" className="text-white text-3xl font-black tracking-tight inline-flex items-center">
            <span className="text-blue-500">Employ</span>Verse
          </Link>
        </div>

        <div className="my-auto max-w-md space-y-8 relative z-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
            Connecting Talent with <span className="text-blue-500">Infinite</span> Opportunities.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            Log in to manage your career credentials, explore premium tailored roles, and chat directly with verified enterprise recruiters.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Verify your professional credentials
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Unlock exclusive premium opportunities
            </li>
            <li className="flex items-center gap-3 text-sm font-semibold text-slate-300">
              <span className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Real-time application status tracker
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} EmployVerse. All corporate rights reserved.
        </div>
      </div>

      {/* Right side: Login Form Container */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
          <div className="text-center mb-8">
            <div className="lg:hidden mb-4">
              <Link
                to="/"
                className="text-slate-900 text-3xl font-black tracking-tight inline-flex items-center"
              >
                <span className="text-blue-600">Employ</span>Verse
              </Link>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {show2FA ? "Two-Factor Auth" : "Sign in to your account"}
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              {show2FA ? "Verify your identity" : "Welcome back to EmployVerse"}
            </p>
          </div>

          <form onSubmit={show2FA ? handleVerify2FA : handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed animate-none">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-2.5 rounded-xl text-xs font-semibold text-center leading-relaxed animate-none">
                {message}
              </div>
            )}

            {!show2FA ? (
              <>
                {/* Email */}
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    onBlur={(e) => {
                      const error = validateEmail(e.target.value);
                      setEmailError(error);
                    }}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${emailError
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                      }`}
                  />
                  {emailError && (
                    <p className="mt-1.5 text-xs font-semibold text-red-600">{emailError}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50"
                  />
                </div>
              </>
            ) : (
              <>
                {/* OTP */}
                <div>
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
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="0 0 0 0 0 0"
                    className="w-full rounded-xl border border-slate-200 py-3 px-4 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all duration-200 text-slate-800 placeholder:text-slate-300 bg-slate-50"
                  />
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setOtp("");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                  >
                    Back to login
                  </button>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading
                ? (show2FA ? "Verifying..." : "Signing in...")
                : (show2FA ? "Verify OTP" : "Sign In")}
            </button>

            <p className="text-center text-xs text-slate-500 font-medium">
              New to EmployVerse?{" "}
              <Link
                to="/signup"
                className="font-bold text-blue-600 hover:text-blue-700"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
