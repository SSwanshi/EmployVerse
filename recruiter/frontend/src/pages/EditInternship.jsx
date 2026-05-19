import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import InternshipForm from '../components/internships/InternshipForm';
import { internshipsApi } from '../services/internshipsApi';
import { companiesApi } from '../services/companiesApi';

const EditInternship = () => {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState(null);
  const [companies, setCompanies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInternshipAndCompanies();
  }, [id]);

  const fetchInternshipAndCompanies = async () => {
    try {
      setLoading(true);
      // Fetch both internship and companies in parallel
      const [internshipResponse, companiesResponse] = await Promise.all([
        internshipsApi.getInternship(id),
        companiesApi.getCompanies(),
      ]);

      if (internshipResponse.success && companiesResponse.success) {
        const internship = internshipResponse.internship;
        setCompanies(companiesResponse.companies || []);

        // Format expiry date for input
        const expiryDate = internship.intExpiry
          ? new Date(internship.intExpiry).toISOString().split('T')[0]
          : '';

        setInitialValues({
          intTitle: internship.intTitle || '',
          intDescription: internship.intDescription || '',
          intRequirements: internship.intRequirements || '',
          intStipend: internship.intStipend || '',
          intLocation: internship.intLocation || '',
          intDuration: internship.intDuration || '',
          intExperience: internship.intExperience || '',
          intPositions: internship.intPositions || '',
          intCompany: internship.intCompany?._id || internship.intCompany || '',
          intExpiry: expiryDate,
        });
      } else {
        setError('Failed to load internship details');
      }
    } catch (err) {
      console.error('Error fetching internship:', err);
      setError('Something went wrong while loading internship details.');
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
      // Prepare internship data
      const internshipData = {
        intTitle: values.intTitle.trim(),
        intDescription: values.intDescription.trim(),
        intRequirements: values.intRequirements.trim(),
        intStipend: parseInt(values.intStipend, 10),
        intLocation: values.intLocation.trim(),
        intDuration: parseInt(values.intDuration, 10),
        intExperience: parseInt(values.intExperience, 10),
        intPositions: parseInt(values.intPositions, 10),
        intCompany: values.intCompany,
        intExpiry: new Date(values.intExpiry).toISOString(),
      };

      // Call the API
      const response = await internshipsApi.updateInternship(id, internshipData);

      if (response.success) {
        setSuccess(response.message || 'Internship updated successfully!');
        // Navigate to internships list after 2 seconds
        setTimeout(() => {
          navigate('/internships');
        }, 2000);
      } else {
        setError(response.message || 'Failed to update internship. Please try again.');
        setSubmitting(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update internship. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading internship details...</p>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded max-w-4xl mx-auto">
          {error || 'Internship not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
            Edit Internship
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Update internship information
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

          {/* Internship Form */}
          <InternshipForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Update Internship"
            companies={companies}
          />
        </div>
      </div>
    </div>
  );
};

export default EditInternship;
