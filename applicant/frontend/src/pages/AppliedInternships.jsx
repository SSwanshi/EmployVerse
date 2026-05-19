import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicantApi } from '../services/applicantApi';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';

const AppliedInternships = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [internshipsById, setInternshipsById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppliedInternships = async () => {
      try {
        setLoading(true);
        setError(null);

        const apps = await applicantApi.getAppliedInternships();
        setApplications(apps || []);

        const uniqueIds = [...new Set((apps || []).map((a) => a.internshipId))].filter(
          Boolean
        );

        if (uniqueIds.length === 0) {
          setInternshipsById({});
          return;
        }

        const results = await Promise.all(
          uniqueIds.map((id) =>
            applicantApi
              .getInternshipById(id)
              .then((internship) => ({ id, internship }))
              .catch(() => ({ id, internship: null }))
          )
        );

        const map = {};
        results.forEach(({ id, internship }) => {
          if (internship) {
            map[id] = internship;
          }
        });
        setInternshipsById(map);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            'Failed to load applied internships. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppliedInternships();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading applied internships...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-lg text-red-600 mb-4">{error}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const hasApplications = applications.length > 0;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header title="Applied Internships" />
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {!hasApplications ? (
          <EmptyState message="You have not applied to any internships yet." />
        ) : (
          <div className="space-y-4">
            {applications.map((application) => {
              const internship = internshipsById[application.internshipId];
              const companyName =
                internship?.intCompany?.companyName || 'Company Not Available';
              const appliedDate = application.AppliedAt
                ? new Date(application.AppliedAt).toLocaleDateString('en-GB')
                : new Date(application.createdAt).toLocaleDateString('en-GB');

              return (
                <div
                  key={application._id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {internship?.intTitle || 'Internship no longer available'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{companyName}</p>
                    {internship?.intLocation && (
                      <p className="text-sm text-gray-500 mt-1">
                        Location: {internship.intLocation}
                      </p>
                    )}
                    {internship?.intStipend && (
                      <p className="text-sm text-gray-500">
                        Stipend: ₹{internship.intStipend}k per month
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      Applied on {appliedDate}
                    </p>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        application.isSelected
                          ? 'bg-green-100 text-green-700'
                          : application.isRejected
                          ? 'bg-red-100 text-red-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {application.isSelected
                        ? 'Selected'
                        : application.isRejected
                        ? 'Rejected'
                        : 'Under Review'}
                    </span>

                    {internship && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/internships/${internship._id}/apply`)
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        View Internship
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedInternships;


