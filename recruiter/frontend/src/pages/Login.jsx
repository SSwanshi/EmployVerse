import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import signupImg from "../../src/assets/images/bgimage.png";
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
      if (response.success) {
        if (response.require2FA) {
          setShow2FA(true);
          setMessage(response.message || "Please enter the OTP sent to your email.");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
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
      if (response.success) {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative font-sans">
      <div className="relative w-11/12 max-w-md bg-white rounded-2xl border border-slate-100 shadow-xl p-8 md:p-10">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">
          {show2FA ? "Two-Factor Auth" : "Recruiter Sign In"}
        </h2>
        <p className="text-center text-slate-500 font-medium mb-8">
          {show2FA ? "Verify your identity" : "Welcome back to EmployVerse"}
        </p>

        <form onSubmit={show2FA ? handleVerify2FA : handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl text-center text-sm font-medium">
              {message}
            </div>
          )}

          {!show2FA ? (
            <>
              <div>
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Email <span className="text-blue-600">*</span>
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
                  placeholder="name@company.com"
                  className={`w-full rounded-xl border p-3.5 text-sm transition-all focus:outline-none focus:ring-2 ${emailError
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                    }`}
                />
                {emailError && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">{emailError}</p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Password <span className="text-blue-600">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="otp" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Enter OTP <span className="text-blue-600">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-semibold"
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
                  className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  Back to login
                </button>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 text-sm mt-2"
          >
            {loading
              ? (show2FA ? "Verifying..." : "Signing in...")
              : (show2FA ? "Verify OTP" : "Sign In")}
          </button>

          <p className="text-center text-xs text-slate-500 pt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

