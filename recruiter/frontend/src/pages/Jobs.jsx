import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jobsApi } from "../services/jobsApi";
import { Pencil, Trash2, Eye } from "lucide-react";
import { formatDate } from "../utils/formatDate";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobsApi.getJobs();
      if (response.success) {
        setJobs(response.jobs || []);
      } else {
        setError("Failed to fetch jobs");
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Something went wrong while fetching jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId, jobTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(jobId);
      const response = await jobsApi.deleteJob(jobId);
      if (response.success) {
        // Remove job from state
        setJobs(jobs.filter(job => job._id !== jobId));
      } else {
        alert(response.message || "Failed to delete job");
      }
    } catch (err) {
      console.error("Error deleting job:", err);
      alert(err.response?.data?.message || "Failed to delete job. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return 'N/A';
    return `${salary} LPA`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Jobs</h2>
        <Link
          to="/jobs/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-md transition-colors"
        >
          + Add Job
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No jobs found.</p>
          <Link
            to="/jobs/add"
            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
          >
            Add your first job
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Salary (In LPA)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Positions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Applications
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => {
                  const isDeleting = deleteLoading === job._id;
                  const companyName = job.jobCompany?.companyName || 'N/A';
                  const isExpired = new Date(job.jobExpiry) < new Date();

                  return (
                    <tr key={job._id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {job.jobTitle}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {job.jobType}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {formatSalary(job.jobSalary)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {job.jobLocation || <span className="text-gray-400">Not specified</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job.noofPositions || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          {formatDate(job.jobExpiry)}
                          {isExpired && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                              Expired
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/jobs/edit/${job._id}`)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Edit Job"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id, job.jobTitle)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Job"
                          >
                            {isDeleting ? (
                              <span className="text-xs">Deleting...</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/jobs/${job._id}/applications`)}
                          className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                          title="View Applications"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Applications
                        </button>
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
  );
};

export default Jobs;
