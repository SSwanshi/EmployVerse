import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import InternshipForm from '../components/internships/InternshipForm';
import { internshipsApi } from '../services/internshipsApi';
import { companiesApi } from '../services/companiesApi';
import { AuthContext } from '../contexts/AuthContext';
import { CheckCircle, AlertCircle } from 'lucide-react';

const AddInternship = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await companiesApi.getCompanies();
      if (response.success) {
        setCompanies(response.companies || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to load companies. Please refresh the page.');
    } finally {
      setLoadingCompanies(false);
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
      const response = await internshipsApi.addInternship(internshipData);

      if (response.success) {
        setSuccess(response.message || 'Internship added successfully!');
        // Navigate to internships list after 2 seconds
        setTimeout(() => {
          navigate('/internships');
        }, 2000);
      } else {
        setError(response.message || 'Failed to add internship. Please try again.');
        setSubmitting(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add internship. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  // Filter verified companies
  const verifiedCompanies = companies.filter(company => company.verified === true);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
            Add Internship
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Post a new internship opportunity and find talented interns
          </p>

          {/* Premium Status Info */}
          {user?.isPremium ? (
            <div className="mb-6 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="font-medium">Pro Recruiter: Unlimited internship posts available!</span>
            </div>
          ) : (
            <div className="mb-6 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span className="font-medium">Free plan: You can post only 1 internship.</span>
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

          {/* Loading Companies */}
          {loadingCompanies ? (
            <div className="text-center py-8">
              <p className="text-blue-800">Loading companies...</p>
            </div>
          ) : verifiedCompanies.length === 0 ? (
            <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
              <p className="font-semibold mb-2">No Verified Companies</p>
              <p className="text-sm">
                You need at least one verified company to post an internship.{' '}
                <a
                  href="/companies/add"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Add a company
                </a>{' '}
                and wait for verification before posting internships.
              </p>
            </div>
          ) : null}

          {/* Internship Form */}
          <InternshipForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Add Internship"
            companies={companies}
          />
        </div>
      </div>
    </div>
  );
};

export default AddInternship;
