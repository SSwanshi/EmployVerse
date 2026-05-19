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
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center font-poppins overflow-hidden"
      style={{
        backgroundImage: `url(${signupImg})`,
        height: "100vh",
      }}
    >
      {/* Overlay to maintain readability */}
      <div className="absolute inset-0 bg-blue-900/60"></div>

      <div className="relative w-11/12 max-w-4xl bg-white/90 rounded-xl shadow-lg p-8 md:p-10">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
          Create Your Account
        </h2>
        <p className="text-center text-yellow-500 font-medium mb-6">
          Join GoHire and start your journey today!
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded text-center">
              {error}
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-blue-800"
              >
                First Name <span className="text-yellow-500">*</span>
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
                className={`mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${touchedFields.firstName && fieldErrors.firstName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-blue-300 focus:ring-blue-500"
                  }`}
              />
              {touchedFields.firstName && fieldErrors.firstName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-blue-800"
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
                placeholder="Last Name"
                className={`mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${touchedFields.lastName && fieldErrors.lastName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-blue-300 focus:ring-blue-500"
                  }`}
              />
              {touchedFields.lastName && fieldErrors.lastName && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.lastName}</p>
              )}
            </div>
          </div>

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
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Email"
              className={`mt-1 w-full rounded-md border p-2 focus:outline-none focus:ring-2 ${touchedFields.email && fieldErrors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-blue-300 focus:ring-blue-500"
                }`}
            />
            {touchedFields.email && fieldErrors.email && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-semibold text-blue-800"
            >
              Phone <span className="text-yellow-500">*</span>
            </label>
            <div
              className={`flex border rounded-md overflow-hidden ${touchedFields.phone && fieldErrors.phone
                ? "border-red-500"
                : "border-blue-300"
                }`}
            >
              <span className="bg-blue-100 px-3 flex items-center text-blue-800 font-medium">
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
                placeholder="Phone Number"
                maxLength="10"
                className={`flex-1 p-2 focus:outline-none focus:ring-2 ${touchedFields.phone && fieldErrors.phone
                  ? "focus:ring-red-500"
                  : "focus:ring-blue-500"
                  }`}
              />
            </div>
            {touchedFields.phone && fieldErrors.phone && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.phone}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-1">
              Gender <span className="text-yellow-500">*</span>
            </label>
            <div className="flex justify-around text-blue-700">
              {["male", "female", "other"].map((g) => (
                <label
                  key={g}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={formData.gender === g}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
            {touchedFields.gender && fieldErrors.gender && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.gender}</p>
            )}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-blue-800"
              >
                Password <span className="text-yellow-500">*</span>
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
    placeholder="Password"
    className={`mt-1 w-full rounded-md border p-2 pr-10 focus:outline-none focus:ring-2 ${
      touchedFields.password && fieldErrors.password
        ? "border-red-500 focus:ring-red-500"
        : "border-blue-300 focus:ring-blue-500"
    }`}
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    👁️
  </button>
</div>

{touchedFields.password && fieldErrors.password && (
  <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
)}

<p className="mt-1 text-xs text-blue-600">
  Password must be at least 8 characters long with at least 2 special characters
</p>


            </div>
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-blue-800"
              >
                Confirm Password <span className="text-yellow-500">*</span>
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
    placeholder="Confirm Password"
    className={`mt-1 w-full rounded-md border p-2 pr-10 focus:outline-none focus:ring-2 ${
      touchedFields.confirmPassword && fieldErrors.confirmPassword
        ? "border-red-500 focus:ring-red-500"
        : "border-blue-300 focus:ring-blue-500"
    }`}
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 hover:text-blue-800"
    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
  >
    👁️
  </button>
</div>

{touchedFields.confirmPassword && fieldErrors.confirmPassword && (
  <p className="mt-1 text-sm text-red-600">
    {fieldErrors.confirmPassword}
  </p>
)}


            </div>
          </div>

          {/* Terms */}
          <div>
            <div className="flex items-start text-sm text-blue-800">
              <input
                id="termsAgree"
                name="termsAgree"
                type="checkbox"
                required
                checked={formData.termsAgree}
                onChange={handleChange}
                className="mt-1 mr-2 h-4 w-4 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="termsAgree">
                By signing up, you agree to our{" "}
                <Link
                  to="/privacy-policy"
                  className="text-yellow-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/terms"
                  className="text-yellow-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms of Use
                </Link>
                . <span className="text-yellow-500">*</span>
              </label>
            </div>
            {error && error.includes("agree") && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>

          <div className="text-center text-sm text-blue-800">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-yellow-600 hover:text-yellow-500"
            >
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
