import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import CompanyForm from '../components/companies/CompanyForm';
import { companiesApi } from '../services/companiesApi';
import { AuthContext } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AddCompany = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values, setSubmitting) => {
    setError('');
    setSuccess('');
    setIsSubmitting(true);
    setSubmitting(true);

    try {
      // Create FormData for multipart/form-data upload
      const formData = new FormData();
      formData.append('companyName', values.companyName.trim());
      formData.append('website', values.website.trim());
      formData.append('location', values.location.trim());

      if (values.logo) {
        formData.append('logo', values.logo);
      }
      // Proof document is required
      if (values.proofDocument) {
        formData.append('proofDocument', values.proofDocument);
      } else {
        setError('Proof document is required');
        setSubmitting(false);
        setIsSubmitting(false);
        return;
      }

      // Call the API
      const response = await companiesApi.addCompany(formData);

      if (response.success) {
        setSuccess(response.message || 'Company added successfully, awaiting verification!');
        // Navigate to companies list after 2 seconds
        setTimeout(() => {
          navigate('/companies');
        }, 2000);
      } else {
        setError(response.message || 'Failed to add company. Please try again.');
        setSubmitting(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add company. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
            Add Company
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Register your company to start posting jobs
          </p>

          {/* Premium Status Info */}
          {user?.isPremium ? (
            <div className="mb-6 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">Pro Recruiter: Unlimited companies available!</span>
            </div>
          ) : (
            <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="font-medium">Free plan: You can add only 1 company.</span>
              </div>
              <Link to="/upgrade" className="text-sm bg-amber-600 text-white px-3 py-1 rounded hover:bg-amber-700 transition">
                Upgrade to Pro
              </Link>
            </div>
          )}

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

          {/* Company Form */}
          <CompanyForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Add Company"
          />
        </div>
      </div>
    </div>
  );
};

export default AddCompany;
