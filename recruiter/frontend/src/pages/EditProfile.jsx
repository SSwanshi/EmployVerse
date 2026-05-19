import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { authApi } from '../services/authApi';
import { UserIcon } from 'lucide-react';

const EditProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authApi.getProfile();
      if (response.success) {
        setProfile(response.user);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Something went wrong while loading profile.');
    } finally {
      setLoading(false);
    }
  };

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must be less than 50 characters')
      .matches(/^[A-Za-z\s]+$/, 'First name should contain only alphabets'),
    lastName: Yup.string()
      .max(50, 'Last name must be less than 50 characters')
      .matches(/^[A-Za-z\s]+$/, 'Last name should contain only alphabets')
      .nullable(),
    phone: Yup.string()
      .required('Phone number is required')
      .matches(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
    gender: Yup.string()
      .required('Gender is required')
      .oneOf(['male', 'female', 'other'], 'Please select a valid gender'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await authApi.updateProfile(values);
      if (response.success) {
        setSuccess('Profile updated successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      } else {
        setError(response.error || 'Failed to update profile');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.error || 'Failed to update profile. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
          {error || 'Failed to load profile'}
        </div>
      </div>
    );
  }

  const initialValues = {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phone: profile.phone || '',
    gender: profile.gender || '',
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2 flex items-center justify-center">
            <UserIcon className="h-8 w-8 mr-2" />
            Edit Profile
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Update your profile information
          </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded text-center">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded text-center">
              {error}
            </div>
          )}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="space-y-6">
                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    First Name <span className="text-yellow-500">*</span>
                  </label>
                  <Field
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    className={`mt-1 w-full rounded-md border ${errors.firstName && touched.firstName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-blue-300 focus:ring-blue-500'
                      } p-2 focus:outline-none focus:ring-2`}
                    onKeyPress={(e) => {
                      const char = String.fromCharCode(e.which);
                      if (!/[A-Za-z\s]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setFieldValue('firstName', value);
                    }}
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    Last Name
                  </label>
                  <Field
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    className={`mt-1 w-full rounded-md border ${errors.lastName && touched.lastName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-blue-300 focus:ring-blue-500'
                      } p-2 focus:outline-none focus:ring-2`}
                    onKeyPress={(e) => {
                      const char = String.fromCharCode(e.which);
                      if (!/[A-Za-z\s]/.test(char)) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setFieldValue('lastName', value);
                    }}
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="mt-1 w-full rounded-md border border-gray-300 bg-gray-100 p-2 text-gray-600 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    Phone <span className="text-yellow-500">*</span>
                  </label>
                  <div className="flex border border-blue-300 rounded-md overflow-hidden">
                    <span className="bg-blue-100 px-3 flex items-center text-blue-800 font-medium">
                      +91
                    </span>
                    <Field
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone Number"
                      maxLength="10"
                      className={`flex-1 p-2 focus:outline-none focus:ring-2 ${errors.phone && touched.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'focus:ring-blue-500'
                        }`}
                      onKeyPress={(e) => {
                        const char = String.fromCharCode(e.which);
                        if (!/[0-9]/.test(char)) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                        setFieldValue('phone', value);
                      }}
                    />
                  </div>
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-blue-800 mb-1">
                    Gender <span className="text-yellow-500">*</span>
                  </label>
                  <div className="flex justify-around text-blue-700 mt-2">
                    {['male', 'female', 'other'].map((g) => (
                      <label
                        key={g}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Field
                          type="radio"
                          name="gender"
                          value={g}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="capitalize">{g}</span>
                      </label>
                    ))}
                  </div>
                  <ErrorMessage
                    name="gender"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-md font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Profile'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
