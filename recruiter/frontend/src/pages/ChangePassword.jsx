import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Lock } from 'lucide-react';
import { authApi } from '../services/authApi';

const ChangePassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validationSchema = Yup.object({
    currentPassword: Yup.string()
      .required('Current password is required'),
    newPassword: Yup.string()
      .required('New password is required')
      .min(4, 'Password must be at least 4 characters'),
    confirmPassword: Yup.string()
      .required('Please confirm your password')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await authApi.changePassword(
        values.currentPassword,
        values.newPassword,
        values.confirmPassword
      );
      
      if (response.success) {
        setSuccess(response.message || 'Password changed successfully!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        setError(response.error || 'Failed to change password');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2 flex items-center justify-center">
            <Lock className="h-8 w-8 mr-2" />
            Change Password
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Update your account password
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
            initialValues={{
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-6">
                {/* Current Password */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    Current Password <span className="text-yellow-500">*</span>
                  </label>
                  <Field
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    className={`mt-1 w-full rounded-md border ${
                      errors.currentPassword && touched.currentPassword
                        ? 'border-red-300'
                        : 'border-blue-300'
                    } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="currentPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    New Password <span className="text-yellow-500">*</span>
                  </label>
                  <Field
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    className={`mt-1 w-full rounded-md border ${
                      errors.newPassword && touched.newPassword
                        ? 'border-red-300'
                        : 'border-blue-300'
                    } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="newPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-blue-800 mb-1"
                  >
                    Confirm New Password <span className="text-yellow-500">*</span>
                  </label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your new password"
                    className={`mt-1 w-full rounded-md border ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-300'
                        : 'border-blue-300'
                    } p-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  />
                  <ErrorMessage
                    name="confirmPassword"
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
                    {isSubmitting ? 'Changing Password...' : 'Change Password'}
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

export default ChangePassword;

