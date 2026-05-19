import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { applicationsApi } from '../services/applicationsApi';
import { getStoredToken } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, XCircle, FileText, ArrowLeft, Lock } from 'lucide-react';
import Badge from '../components/ui/Badge';
import { formatDate } from '../utils/formatDate';

const Applications = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobCompany, setJobCompany] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await applicationsApi.getJobApplications(jobId);
      if (response.success) {
        const applicantsList = response.applicants || response.applicant || [];
        setApplications(Array.isArray(applicantsList) ? applicantsList : []);
        setJobTitle(response.jobTitle || '');
        setJobCompany(response.jobCompany || '');
      } else {
        setError(response.message || response.error || 'Failed to fetch applications');
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Something went wrong while fetching applications.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (applicantId) => {
    try {
      setActionLoading(`select-${applicantId}`);
      const response = await applicationsApi.selectApplicant(jobId, applicantId);
      if (response.success) {
        // Update the application in the list
        setApplications(applications.map(app =>
          app._id === applicantId
            ? { ...app, isSelected: true, isRejected: false }
            : app
        ));
      } else {
        alert(response.message || 'Failed to select applicant');
      }
    } catch (err) {
      console.error('Error selecting applicant:', err);
      alert(err.response?.data?.message || 'Failed to select applicant. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (applicantId) => {
    if (!window.confirm('Are you sure you want to reject this applicant?')) {
      return;
    }

    try {
      setActionLoading(`reject-${applicantId}`);
      const response = await applicationsApi.rejectApplicant(jobId, applicantId);
      if (response.success) {
        // Update the application in the list
        setApplications(applications.map(app =>
          app._id === applicantId
            ? { ...app, isRejected: true, isSelected: false }
            : app
        ));
      } else {
        alert(response.message || 'Failed to reject applicant');
      }
    } catch (err) {
      console.error('Error rejecting applicant:', err);
      alert(err.response?.data?.message || 'Failed to reject applicant. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const getResumeUrl = (resumeId) => {
    if (!resumeId) return null;
    const token = getStoredToken();
    return `${API_BASE}/api/applications/${jobId}/resume/${resumeId}?token=${encodeURIComponent(token)}`;
  };

  const getGenderDisplay = (gender) => {
    if (!gender) return 'N/A';
    return gender.charAt(0).toUpperCase() + gender.slice(1);
  };

  const getStatusBadge = (isSelected, isRejected) => {
    if (isSelected) {
      return (
        <Badge variant="success" className="flex items-center gap-1 w-fit">
          <CheckCircle className="h-3 w-3" />
          Selected
        </Badge>
      );
    }
    if (isRejected) {
      return (
        <Badge variant="danger" className="flex items-center gap-1 w-fit">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="w-fit">
        Pending
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Link>
          <h2 className="text-3xl font-bold text-blue-800">
            Job Applications
          </h2>
          {jobTitle && (
            <p className="text-gray-600 mt-2">
              <span className="font-semibold">{jobTitle}</span>
              {jobCompany && ` - ${jobCompany}`}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">No applications found for this job.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const isLoading = actionLoading?.startsWith(`select-${application._id}`) ||
                      actionLoading?.startsWith(`reject-${application._id}`);
                    const applicantName = `${application.firstName || ''} ${application.lastName || ''}`.trim();

                    return (
                      <tr
                        key={application._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          application.isSelected ? 'bg-green-50' : application.isRejected ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user?.isPremium ? (
                            <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                              <Link to={`/applicant/${application.userId}`} className="hover:underline">
                                {applicantName || 'N/A'}
                              </Link>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                              {applicantName || 'N/A'}
                              <Link to="/upgrade" title="Upgrade to Pro to view profile">
                                <Lock className="h-3.5 w-3.5 text-yellow-500" />
                              </Link>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            <a
                              href={`mailto:${application.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {application.email || 'N/A'}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            <a
                              href={`tel:${application.phone}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {application.phone || 'N/A'}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {getGenderDisplay(application.gender)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {formatDate(application.AppliedAt || application.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(application.isSelected, application.isRejected)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {application.resumeId ? (
                            <a
                              href={getResumeUrl(application.resumeId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View Resume
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">No resume</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {!application.isSelected && !application.isRejected && (
                              <>
                                <button
                                  onClick={() => handleSelect(application._id)}
                                  disabled={isLoading}
                                  className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Select Applicant"
                                >
                                  {actionLoading?.startsWith(`select-${application._id}`) ? (
                                    'Selecting...'
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Select
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(application._id)}
                                  disabled={isLoading}
                                  className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Reject Applicant"
                                >
                                  {actionLoading?.startsWith(`reject-${application._id}`) ? (
                                    'Rejecting...'
                                  ) : (
                                    <>
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </>
                                  )}
                                </button>
                              </>
                            )}
                            {application.isSelected && (
                              <span className="text-green-700 text-sm font-medium">
                                Selected ✓
                              </span>
                            )}
                            {application.isRejected && (
                              <span className="text-red-700 text-sm font-medium">
                                Rejected ✗
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
