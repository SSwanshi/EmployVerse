import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import signupImg from "../../src/assets/images/bgimage.png";
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
  const [touchedFields, setTouchedFields] = useState({});
  const { signup } = useAuth();
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
      // Only allow digits and limit to 10
      if (value === "" || (/^\d+$/.test(value) && value.length <= 10)) {
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

    // Re-validate confirmPassword when password changes
    if (name === "password" && touchedFields.confirmPassword && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, fieldValue);
      setFieldErrors({
        ...fieldErrors,
        confirmPassword: confirmError,
      });
    }

    // Validate gender immediately when selected
    if (name === "gender") {
      const genderError = validateGender(fieldValue);
      setFieldErrors({
        ...fieldErrors,
        gender: genderError,
      });
      setTouchedFields({
        ...touchedFields,
        gender: true,
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouchedFields({
      ...touchedFields,
      [name]: true,
    });

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

  const validateAllFields = () => {
    const errors = {};
    errors.firstName = validateFirstName(formData.firstName);
    errors.lastName = validateLastName(formData.lastName);
    errors.email = validateEmailField(formData.email);
    errors.phone = validatePhone(formData.phone);
    errors.gender = validateGender(formData.gender);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    setFieldErrors(errors);
    setTouchedFields({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      gender: true,
      password: true,
      confirmPassword: true,
    });

    return !Object.values(errors).some((error) => error !== "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all fields
    if (!validateAllFields()) {
      setError("Please fix all errors before submitting");
      return;
    }

    // Check terms agreement
    if (!formData.termsAgree) {
      setError("You must agree to the Privacy Policy and Terms of Use");
      return;
    }

    setLoading(true);

    try {
      const response = await signup(formData);
      if (response.success) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-6 relative font-sans">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-xl p-8 md:p-10">
        <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-2 tracking-tight">
          Create Your Account
        </h2>
        <p className="text-center text-slate-500 font-medium mb-8">
          Join EmployVerse and start your journey today!
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl text-center text-sm font-medium">
              {error}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                First Name <span className="text-blue-600">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="First Name"
                className={`w-full rounded-xl border p-3.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  touchedFields.firstName && fieldErrors.firstName
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                }`}
              />
              {touchedFields.firstName && fieldErrors.firstName && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Last Name"
                className={`w-full rounded-xl border p-3.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                  touchedFields.lastName && fieldErrors.lastName
                    ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                    : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                }`}
              />
              {touchedFields.lastName && fieldErrors.lastName && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Email <span className="text-blue-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="name@company.com"
              className={`w-full rounded-xl border p-3.5 text-sm transition-all focus:outline-none focus:ring-2 ${
                touchedFields.email && fieldErrors.email
                  ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                  : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {touchedFields.email && fieldErrors.email && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Phone Number <span className="text-blue-600">*</span>
            </label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-600 transition-all">
              <span className="bg-slate-50 border-r border-slate-200 px-4 flex items-center text-slate-500 text-sm font-medium">
                +91
              </span>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="00000 00000"
                maxLength="10"
                className="w-full p-3.5 text-sm focus:outline-none"
              />
            </div>
            {touchedFields.phone && fieldErrors.phone && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Gender <span className="text-blue-600">*</span>
            </label>
            <div className="grid grid-cols-3 gap-4">
              {["male", "female", "other"].map((g) => (
                <label
                  key={g}
                  className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                    formData.gender === g
                      ? "border-blue-600 bg-blue-50/20 text-blue-600"
                      : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="sr-only"
                  />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
            {touchedFields.gender && fieldErrors.gender && (
              <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.gender}</p>
            )}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Password <span className="text-blue-600">*</span>
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
                  placeholder="••••••••"
                  className={`w-full rounded-xl border p-3.5 pr-12 text-sm transition-all focus:outline-none focus:ring-2 ${
                    touchedFields.password && fieldErrors.password
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-900 focus:outline-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {touchedFields.password && fieldErrors.password ? (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">
                  Must be &ge; 8 characters with 2 special characters
                </p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Confirm Password <span className="text-blue-600">*</span>
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
                  placeholder="••••••••"
                  className={`w-full rounded-xl border p-3.5 pr-12 text-sm transition-all focus:outline-none focus:ring-2 ${
                    touchedFields.confirmPassword && fieldErrors.confirmPassword
                      ? "border-red-300 focus:ring-red-500/20 focus:border-red-500"
                      : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-600"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 hover:text-slate-900 focus:outline-none"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {touchedFields.confirmPassword && fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start text-sm text-slate-600 pt-2">
            <input
              id="termsAgree"
              name="termsAgree"
              type="checkbox"
              required
              checked={formData.termsAgree}
              onChange={handleChange}
              className="mt-1 mr-3 h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 focus:ring-offset-0"
            />
            <label htmlFor="termsAgree" className="text-xs font-medium text-slate-500 leading-normal">
              By signing up, you agree to our{" "}
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-semibold" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-semibold" target="_blank" rel="noopener noreferrer">
                Terms of Use
              </Link>
              . <span className="text-blue-600">*</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 text-sm"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="text-center text-xs text-slate-500 pt-2">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;

