import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import signupImg from "../assets/images/header_image.webp";
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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-poppins relative"
      style={{
        backgroundImage: `url(${signupImg})`,
        height: "100vh",
      }}
    >
      {/* Blue overlay for readability */}
      <div className="absolute inset-0 bg-blue-900/60"></div>

      <div className="relative w-11/12 max-w-md bg-white/90 rounded-xl shadow-lg p-8 md:p-10">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
          {show2FA ? "Two-Factor Auth" : "Applicant Sign In"}
        </h2>
        <p className="text-center text-yellow-500 font-medium mb-6">
          {show2FA ? "Verify your identity" : "Welcome back to GoHire"}
        </p>

        <form onSubmit={show2FA ? handleVerify2FA : handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-2 rounded text-center">
              {message}
            </div>
          )}

          {!show2FA ? (
            <>
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-blue-800"
                >
                  Email <span className="text-yellow-500">*</span>
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
                  placeholder="Enter your email"
                  className={`mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${emailError
                      ? "border-red-500 focus:ring-red-500"
                      : "border-blue-300 focus:ring-blue-500"
                    }`}
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-blue-800"
                >
                  Password <span className="text-yellow-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="mt-1 w-full rounded-md border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Forgot Password */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-yellow-600 hover:text-yellow-500 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* OTP */}
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-semibold text-blue-800"
                >
                  Enter OTP <span className="text-yellow-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="mt-1 w-full rounded-md border border-blue-300 p-2 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="text-sm text-blue-600 hover:text-blue-500 font-medium"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading
              ? (show2FA ? "Verifying..." : "Signing in...")
              : (show2FA ? "Verify OTP" : "Sign In")}
          </button>

          <p className="text-center text-sm text-blue-800">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-yellow-600 hover:text-yellow-500"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
