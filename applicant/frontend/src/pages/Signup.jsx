import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateEmail } from "../utils/emailValidation";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    confirmPassword: "",
    termsAgree: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [show2FA, setShow2FA] = useState(false);
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const { signup, verify2FA } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateFirstName = (value) => {
    if (!value.trim()) {
      return "First name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(value)) {
      return "First name should contain only alphabets";
    }
    return "";
  };

  const validateLastName = (value) => {
    if (value && !/^[A-Za-z\s]+$/.test(value)) {
      return "Last name should contain only alphabets";
    }
    return "";
  };

  const validateEmailField = (value) => {
    return validateEmail(value);
  };

  const validatePhone = (value) => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    if (!/^\d+$/.test(value)) {
      return "Phone number should contain only digits";
    }
    if (value.length !== 10) {
      return "Phone number must be exactly 10 digits";
    }
    return "";
  };

  const validateGender = (value) => {
    if (!value) {
      return "Please select a gender";
    }
    return "";
  };

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    const specialCharCount = (value.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/g) || []).length;
    if (specialCharCount < 2) {
      return "Password must contain at least 2 special characters";
    }
    return "";
  };

  const validateConfirmPassword = (value, password) => {
    if (!value) {
      return "Please confirm your password";
    }
    if (value !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Restrict input based on field type
    if (name === "firstName" || name === "lastName") {
      // Only allow alphabets and spaces
      if (value === "" || /^[A-Za-z\s]*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else if (name === "phone") {
      // Only allow digits
      if (value === "" || /^\d*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: fieldValue,
      });
    }

    // Clear error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: "",
      });
    }

    // Re-validate confirmPassword if password changes
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setFieldErrors({
        ...fieldErrors,
        confirmPassword: confirmError,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "firstName":
        error = validateFirstName(value);
        break;
      case "lastName":
        error = validateLastName(value);
        break;
      case "email":
        error = validateEmailField(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "gender":
        error = validateGender(formData.gender);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
      default:
        break;
    }

    setFieldErrors({
      ...fieldErrors,
      [name]: error,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields
    const errors = {};
    errors.firstName = validateFirstName(formData.firstName);
    errors.lastName = validateLastName(formData.lastName);
    errors.email = validateEmailField(formData.email);
    errors.phone = validatePhone(formData.phone);
    errors.gender = validateGender(formData.gender);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.confirmPassword, formData.password);
    
    if (!formData.termsAgree) {
      errors.termsAgree = "You must agree to the terms and conditions";
    }

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      return;
    }

    setLoading(true);

    try {
      const response = await signup(formData);
      if (response && (response.success || response.message)) {
        if (response.require2FA) {
          setShow2FA(true);
          setMessage(response.message || "Please enter the OTP sent to your email.");
        } else {
          navigate("/login");
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await verify2FA(formData.email, otp);
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
    <div className="min-h-screen grid lg:grid-cols-12 bg-white font-sans">
      {/* Left side: Premium Branding Panel */}
      <div className="hidden lg:flex lg:col-span-5 flex-col justify-between bg-slate-950 text-white p-12 relative overflow-hidden">
        {/* Backdrop Glow */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none animate-pulse"></div>

        <div>
          <Link to="/" className="text-white text-3xl font-black tracking-tight inline-flex items-center">
            <span className="text-blue-500">Employ</span>Verse
          </Link>
        </div>

        <div className="my-auto max-w-sm space-y-8 relative z-10">
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white">
            Kickstart your <span className="text-blue-500">professional</span> journey.
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Create an applicant profile to search, filter, and easily apply for career-defining jobs and internships.
          </p>
          <ul className="space-y-4">
            <li className="flex items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Build a polished verified resume profile
            </li>
            <li className="flex items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Search verified listings by location or role
            </li>
            <li className="flex items-center gap-3 text-xs font-semibold text-slate-300">
              <span className="w-5 h-5 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">✓</span>
              Access career tools & direct application pipelines
            </li>
          </ul>
        </div>

        <div className="text-xs text-slate-500">
          © {new Date().getFullYear()} EmployVerse. All corporate rights reserved.
        </div>
      </div>

      {/* Right side: Signup Form Container */}
      <div className="lg:col-span-7 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl shadow-xl p-8 md:p-10 transition-all duration-300 hover:shadow-2xl">
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
              {show2FA ? "Two-Factor Auth" : "Create your account"}
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-1">
              {show2FA ? "Verify your email to continue" : "Join EmployVerse and start your journey today!"}
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
            {/* Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Sarvjeet"
                  className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    fieldErrors.firstName
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                  }`}
                />
                {fieldErrors.firstName && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Swanshi"
                  className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    fieldErrors.lastName
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                  }`}
                />
                {fieldErrors.lastName && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email & Phone Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="name@example.com"
                  className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    fieldErrors.email
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  maxLength="10"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="10 digit number"
                  className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                    fieldErrors.phone
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.phone}</p>
                )}
              </div>
            </div>

            {/* Gender Selection */}
            <div>
              <label
                htmlFor="gender"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full rounded-xl border py-2.5 px-4 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                  fieldErrors.gender
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 bg-slate-50"
                }`}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {fieldErrors.gender && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.gender}</p>
              )}
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Min 8 characters"
                    className={`w-full rounded-xl border py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      fieldErrors.password
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600 leading-normal">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Re-enter password"
                    className={`w-full rounded-xl border py-2.5 px-4 pr-10 focus:outline-none focus:ring-2 transition-all duration-200 text-sm ${
                      fieldErrors.confirmPassword
                        ? "border-red-300 focus:ring-red-500/20 focus:border-red-500 text-red-900 placeholder:text-red-300"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800 placeholder:text-slate-400 bg-slate-50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    <i className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"} text-xs`}></i>
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Terms Agree */}
            <div>
              <div className="flex items-start text-xs text-slate-500 font-medium">
                <input
                  type="checkbox"
                  id="termsAgree"
                  name="termsAgree"
                  required
                  checked={formData.termsAgree}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 mr-2.5 h-4.5 w-4.5 text-blue-600 border border-slate-350 rounded focus:ring-blue-500/20"
                />
                <label htmlFor="termsAgree">
                  I agree to the{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline font-semibold">
                    Terms of Use
                  </Link>
                  .
                </label>
              </div>
              {fieldErrors.termsAgree && (
                <p className="mt-1.5 text-xs font-semibold text-red-600">{fieldErrors.termsAgree}</p>
              )}
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
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading
                ? (show2FA ? "Verifying..." : "Creating Account...")
                : (show2FA ? "Verify OTP" : "Sign Up")}
            </button>

            {!show2FA && (
              <div className="text-center text-xs text-slate-500 font-medium">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-700"
                >
                  Log In
                </Link>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
