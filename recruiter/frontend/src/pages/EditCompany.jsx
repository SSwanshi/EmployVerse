import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyForm from '../components/companies/CompanyForm';
import { companiesApi } from '../services/companiesApi';

const EditCompany = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getCompany(id);
      if (response.success) {
        const company = response.company;
        setInitialValues({
          companyName: company.companyName || '',
          website: company.website || '',
          location: company.location || '',
          logo: null, // Files are not returned, user can upload new ones
          proofDocument: null,
        });
      } else {
        setError('Failed to load company details');
      }
    } catch (err) {
      console.error('Error fetching company:', err);
      setError('Something went wrong while loading company details.');
    } finally {
      setLoading(false);
    }
  };

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

      // Append files only if they exist (new uploads)
      if (values.logo) {
        formData.append('logo', values.logo);
      }
      if (values.proofDocument) {
        formData.append('proofDocument', values.proofDocument);
      }

      // Call the API
      const response = await companiesApi.updateCompany(id, formData);

      if (response.success) {
        setSuccess(response.message || 'Company updated successfully!');
        // Navigate to companies list after 2 seconds
        setTimeout(() => {
          navigate('/companies');
        }, 2000);
      } else {
        setError(response.message || 'Failed to update company. Please try again.');
        setSubmitting(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update company. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded max-w-2xl mx-auto">
          {error || 'Company not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
            Edit Company
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Update your company information
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

          {/* Company Form */}
          <CompanyForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Update Company"
            showProofDocument={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EditCompany;
