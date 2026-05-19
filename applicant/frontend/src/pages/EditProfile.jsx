import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import profileService from "../services/profileService";
import { useToast } from "../contexts/ToastContext";
import { validateEmail } from "../utils/emailValidation";

const EditProfile = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'male',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '', color: '' });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const data = await profileService.getProfile();
      setFormData({
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        email: data.user.email || '',
        phone: data.user.phone || '',
        gender: data.user.gender || 'male',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      showToast('Failed to load profile data', 'error');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation for all fields
    if (name === 'firstName' || name === 'lastName') {
      validateName(name, value);
    } else if (name === 'email') {
      validateEmailField(value);
    } else if (name === 'phone') {
      validatePhone(value);
    } else if (name === 'newPassword') {
      validateNewPassword(value);
      checkPasswordStrength(value);
      // Re-validate confirm password if it has a value
      if (formData.confirmNewPassword) {
        validateConfirmPassword(formData.confirmNewPassword, value);
      }
    } else if (name === 'confirmNewPassword') {
      validateConfirmPassword(value, formData.newPassword);
    } else if (name === 'currentPassword') {
      validateCurrentPassword(value);
    }
  };

  const validateName = (fieldName, name) => {
    // Allow only letters and spaces (no special characters)
    if (!name || name.trim().length === 0) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: `${fieldName === 'firstName' ? 'First' : 'Last'} name is required`,
      }));
      return false;
    }
    const isValid = /^[A-Za-z\s]+$/.test(name) && name.trim().length >= 2;
    setErrors((prev) => ({
      ...prev,
      [fieldName]: !isValid ? `${fieldName === 'firstName' ? 'First' : 'Last'} name should contain at least 2 characters and only letters and spaces (no special characters allowed)` : '',
    }));
    return isValid;
  };

  const validateEmailField = (email) => {
    const error = validateEmail(email);
    setErrors((prev) => ({ ...prev, email: error }));
    return error === '';
  };

  const validatePhone = (phone) => {
    if (!phone || phone.trim().length === 0) {
      setErrors((prev) => ({
        ...prev,
        phone: 'Phone number is required',
      }));
      return false;
    }
    const isValid = /^[0-9]{10}$/.test(phone);
    setErrors((prev) => ({
      ...prev,
      phone: !isValid ? 'Please enter a valid 10-digit phone number.' : '',
    }));
    return isValid;
  };

  const validateCurrentPassword = (password) => {
    // Only validate if user is trying to change password
    if (formData.newPassword || formData.confirmNewPassword) {
      if (!password || password.trim().length === 0) {
        setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required to change password' }));
        return false;
      }
      setErrors((prev) => ({ ...prev, currentPassword: '' }));
      return true;
    }
    setErrors((prev) => ({ ...prev, currentPassword: '' }));
    return true;
  };

  const validateNewPassword = (password) => {
    // Only validate if user entered current password or confirm password
    if (!formData.currentPassword && !formData.confirmNewPassword && !password) {
      setErrors((prev) => ({ ...prev, newPassword: '' }));
      return true;
    }

    if ((formData.currentPassword || formData.confirmNewPassword) && (!password || password.trim().length === 0)) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      return false;
    }

    if (password && password.length < 8) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 8 characters long' }));
      return false;
    }

    if (password && password.length > 0) {
      // Check for at least one letter
      const hasLetter = /[a-zA-Z]/.test(password);
      
      if (!hasLetter) {
        setErrors((prev) => ({ ...prev, newPassword: 'Password must contain at least one letter' }));
        return false;
      }

      // Check for at least 2 special characters
      const specialChars = password.match(/[^a-zA-Z0-9]/g);
      const specialCharCount = specialChars ? specialChars.length : 0;

      if (specialCharCount < 2) {
        setErrors((prev) => ({ ...prev, newPassword: 'Password must contain at least 2 special characters' }));
        return false;
      }
    }

    setErrors((prev) => ({ ...prev, newPassword: '' }));
    return true;
  };

  const validateConfirmPassword = (confirmPassword, newPassword) => {
    // Only validate if user entered new password or current password
    if (!formData.currentPassword && !newPassword && !confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
      return true;
    }

    if ((formData.currentPassword || newPassword) && (!confirmPassword || confirmPassword.trim().length === 0)) {
      setErrors((prev) => ({ ...prev, confirmNewPassword: 'Please confirm your new password' }));
      return false;
    }

    if (confirmPassword !== newPassword) {
      setErrors((prev) => ({ ...prev, confirmNewPassword: 'Passwords do not match' }));
      return false;
    }

    setErrors((prev) => ({ ...prev, confirmNewPassword: '' }));
    return true;
  };

  const checkPasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength({ strength: 0, text: '', color: '' });
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    let text = '';
    let color = '';
    if (strength < 40) {
      text = 'Weak';
      color = 'bg-red-500';
    } else if (strength < 70) {
      text = 'Medium';
      color = 'bg-yellow-500';
    } else {
      text = 'Strong';
      color = 'bg-green-500';
    }

    setPasswordStrength({ strength, text, color });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate all required fields
    const isFirstNameValid = validateName('firstName', formData.firstName);
    const isLastNameValid = validateName('lastName', formData.lastName);
    const isEmailValid = validateEmailField(formData.email);
    const isPhoneValid = validatePhone(formData.phone);

    if (!isFirstNameValid || !isLastNameValid || !isEmailValid || !isPhoneValid) {
      showToast('Please fix the validation errors before submitting', 'error');
      return;
    }

    // Password validation
    if (formData.currentPassword || formData.newPassword || formData.confirmNewPassword) {
      const isCurrentPasswordValid = validateCurrentPassword(formData.currentPassword);
      const isNewPasswordValid = validateNewPassword(formData.newPassword);
      const isConfirmPasswordValid = validateConfirmPassword(formData.confirmNewPassword, formData.newPassword);

      if (!isCurrentPasswordValid || !isNewPasswordValid || !isConfirmPasswordValid) {
        showToast('Please fix the password validation errors', 'error');
        return;
      }
    }

    try {
      setLoading(true);
      
      // Prepare data to send - only include password fields if they're all filled
      const dataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
      };
      
      // Only include password fields if user wants to change password
      if (formData.currentPassword && formData.newPassword && formData.confirmNewPassword) {
        dataToSend.currentPassword = formData.currentPassword;
        dataToSend.newPassword = formData.newPassword;
        dataToSend.confirmNewPassword = formData.confirmNewPassword;
      }
      
      const response = await profileService.updateProfile(dataToSend);
      const message = dataToSend.currentPassword
        ? 'Profile and password updated successfully'
        : response?.message || 'Profile updated successfully';
      
      showToast(message, 'success');
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      console.error('Update error:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to update profile';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600"></i>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <header className="pt-32 pb-24 text-white relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 flex flex-col items-center justify-start">
              <div className="relative">
                <div className="w-40 h-40 flex items-center justify-center rounded-full border-4 border-yellow-400 shadow-md bg-blue-50 text-blue-900 text-6xl font-bold">
                  {formData.firstName?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-blue-900 mb-6 pb-2 border-b-2 border-yellow-400">
                Edit Profile Information
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`mt-1 block text-black w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.firstName && (
                      <p className="text-xs mt-1 text-red-600 font-medium">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`mt-1 block text-black w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.lastName && (
                      <p className="text-xs mt-1 text-red-600 font-medium">{errors.lastName}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={(e) => validateEmailField(e.target.value)}
                      className={`mt-1 block text-black w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.email && <p className="text-xs mt-1 text-red-600 font-medium">{errors.email}</p>}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`mt-1 block text-black w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2 ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      required
                    />
                    {errors.phone && <p className="text-xs mt-1 text-red-600 font-medium">{errors.phone}</p>}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="mt-1 block text-black w-full border border-blue-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-blue-700">Member Since</label>
                    <p className="text-lg text-blue-900 font-semibold">25 March 2025</p>
                  </div>

                  <div className="md:col-span-2 border-t-2 border-yellow-400 pt-4 mt-4">
                    <h3 className="text-xl font-bold text-blue-900 mb-4">Change Password</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-700">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className={`mt-1 block text-black w-full border rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 ${
                              errors.currentPassword 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-600 hover:text-gray-800"
                          >
                            {showCurrentPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.currentPassword && (
                          <p className="text-xs mt-1 text-red-600 font-medium">{errors.currentPassword}</p>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-700">New Password</label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className={`mt-1 block text-black w-full border rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 ${
                              errors.newPassword 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-600 hover:text-gray-800"
                          >
                            {showNewPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="text-xs mt-1 text-red-600 font-medium">{errors.newPassword}</p>
                        )}
                        {!errors.newPassword && formData.newPassword && (
                          <>
                            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                                style={{ width: `${passwordStrength.strength}%` }}
                              ></div>
                            </div>
                            <p className={`text-xs mt-1 ${passwordStrength.color.replace('bg-', 'text-')}`}>
                              {passwordStrength.text}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-blue-700">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className={`mt-1 block text-black w-full border rounded-md py-2 px-3 pr-10 focus:outline-none focus:ring-2 ${
                              errors.confirmNewPassword 
                                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                                : 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-600 hover:text-gray-800"
                          >
                            {showConfirmPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.confirmNewPassword && (
                          <p className="text-xs mt-1 text-red-600 font-medium">{errors.confirmNewPassword}</p>
                        )}
                        {!errors.confirmNewPassword && formData.confirmNewPassword && formData.newPassword === formData.confirmNewPassword && (
                          <p className="text-xs mt-1 text-green-600 font-medium">
                            ✓ Passwords match
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        Note: Leave password fields blank if you don't want to change your password.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </header>
  );
};

export default EditProfile;
