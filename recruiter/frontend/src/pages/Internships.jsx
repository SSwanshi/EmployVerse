import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { internshipsApi } from "../services/internshipsApi";
import { Pencil, Trash2, Eye } from "lucide-react";
import { formatDate } from "../utils/formatDate";

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await internshipsApi.getInternships();
      if (response.success) {
        setInternships(response.internships || []);
      } else {
        setError("Failed to fetch internships");
      }
    } catch (err) {
      console.error("Error fetching internships:", err);
      setError("Something went wrong while fetching internships.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (internshipId, internshipTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${internshipTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(internshipId);
      const response = await internshipsApi.deleteInternship(internshipId);
      if (response.success) {
        // Remove internship from state
        setInternships(internships.filter(internship => internship._id !== internshipId));
      } else {
        alert(response.message || "Failed to delete internship");
      }
    } catch (err) {
      console.error("Error deleting internship:", err);
      alert(err.response?.data?.message || "Failed to delete internship. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatStipend = (stipend) => {
    if (!stipend) return 'N/A';
    return `${stipend} `;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return `${duration} ${duration === 1 ? 'Month' : 'Months'}`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading internships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Internships</h2>
        <Link
          to="/internships/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-md transition-colors"
        >
          + Add Internship
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {internships.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No internships found.</p>
          <Link
            to="/internships/add"
            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
          >
            Add your first internship
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
                    Internship Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Stipend (per month)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Opportunities
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
                {internships.map((internship) => {
                  const isDeleting = deleteLoading === internship._id;
                  const companyName = internship.intCompany?.companyName || 'N/A';
                  const isExpired = new Date(internship.intExpiry) < new Date();

                  return (
                    <tr key={internship._id} className={`hover:bg-gray-50 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {internship.intTitle}
                        </div>
                        {internship.intExperience !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Exp: {internship.intExperience} {internship.intExperience === 1 ? 'Year' : 'Years'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-semibold">
                          {formatStipend(internship.intStipend)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {internship.intLocation || <span className="text-gray-400">Not specified</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDuration(internship.intDuration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {internship.intPositions || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isExpired ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                          {formatDate(internship.intExpiry)}
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
                            onClick={() => navigate(`/internships/edit/${internship._id}`)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Edit Internship"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(internship._id, internship.intTitle)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Internship"
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
                          onClick={() => navigate(`/internships/${internship._id}/applications`)}
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

export default Internships;
