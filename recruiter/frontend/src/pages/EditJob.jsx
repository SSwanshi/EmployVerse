import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import JobForm from '../components/jobs/JobForm';
import { jobsApi } from '../services/jobsApi';
import { companiesApi } from '../services/companiesApi';

const EditJob = () => {
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
    fetchJobAndCompanies();
  }, [id]);

  const fetchJobAndCompanies = async () => {
    try {
      setLoading(true);
      // Fetch both job and companies in parallel
      const [jobResponse, companiesResponse] = await Promise.all([
        jobsApi.getJob(id),
        companiesApi.getCompanies(),
      ]);

      if (jobResponse.success && companiesResponse.success) {
        const job = jobResponse.job;
        setCompanies(companiesResponse.companies || []);

        // Format expiry date for input
        const expiryDate = job.jobExpiry
          ? new Date(job.jobExpiry).toISOString().split('T')[0]
          : '';

        setInitialValues({
          jobTitle: job.jobTitle || '',
          jobDescription: job.jobDescription || '',
          jobRequirements: job.jobRequirements || '',
          jobSalary: job.jobSalary || '',
          jobLocation: job.jobLocation || '',
          jobType: job.jobType || '',
          jobExperience: job.jobExperience || '',
          noofPositions: job.noofPositions || '',
          jobCompany: job.jobCompany?._id || job.jobCompany || '',
          jobExpiry: expiryDate,
        });
      } else {
        setError('Failed to load job details');
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Something went wrong while loading job details.');
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
      // Prepare job data
      const jobData = {
        jobTitle: values.jobTitle.trim(),
        jobDescription: values.jobDescription.trim(),
        jobRequirements: values.jobRequirements.trim(),
        jobSalary: parseInt(values.jobSalary, 10),
        jobLocation: values.jobLocation.trim(),
        jobType: values.jobType,
        jobExperience: parseInt(values.jobExperience, 10),
        noofPositions: parseInt(values.noofPositions, 10),
        jobCompany: values.jobCompany,
        jobExpiry: new Date(values.jobExpiry).toISOString(),
      };

      // Call the API
      const response = await jobsApi.updateJob(id, jobData);

      if (response.success) {
        setSuccess(response.message || 'Job updated successfully!');
        // Navigate to jobs list after 2 seconds
        setTimeout(() => {
          navigate('/jobs');
        }, 2000);
      } else {
        setError(response.message || 'Failed to update job. Please try again.');
        setSubmitting(false);
        setIsSubmitting(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update job. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!initialValues) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded max-w-4xl mx-auto">
          {error || 'Job not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-2">
            Edit Job
          </h2>
          <p className="text-center text-yellow-500 font-medium mb-6">
            Update job information
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

          {/* Job Form */}
          <JobForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitButtonText="Update Job"
            companies={companies}
          />
        </div>
      </div>
    </div>
  );
};

export default EditJob;
