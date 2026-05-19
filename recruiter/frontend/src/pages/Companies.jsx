import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { companiesApi } from "../services/companiesApi";
import Badge from "../components/ui/Badge";
import { CheckCircle, Eye } from "lucide-react";
import { Pencil, Trash2 } from "lucide-react";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [viewingProof, setViewingProof] = useState(null);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesApi.getCompanies();
      if (response.success) {
        setCompanies(response.companies || []);
      } else {
        setError("Failed to fetch companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
      setError("Something went wrong while fetching companies.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(companyId);
      const response = await companiesApi.deleteCompany(companyId);
      if (response.success) {
        // Remove company from state
        setCompanies(companies.filter(company => company._id !== companyId));
      } else {
        alert(response.message || "Failed to delete company");
      }
    } catch (err) {
      console.error("Error deleting company:", err);
      alert(err.response?.data?.message || "Failed to delete company. Please try again.");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getLogoUrl = (logoId) => {
    if (!logoId) return null;
    return `${API_BASE}/recruiter/logo/${logoId}`;
  };

  const getProofUrl = (proofId) => {
    if (!proofId) return null;
    return `${API_BASE}/recruiter/proof/${proofId}`;
  };

  const handleViewProof = async (proofId, companyName) => {
    if (!proofId) {
      alert('Proof document not available');
      return;
    }
    
    try {
      const proofUrl = getProofUrl(proofId);
      console.log('Opening proof document:', proofUrl);
      
      // Test if the URL is accessible
      const response = await fetch(proofUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      setViewingProof({ url: proofUrl, companyName });
    } catch (error) {
      console.error('Error loading proof document:', error);
      alert(`Failed to load proof document: ${error.message}. Please check your connection and try again.`);
    }
  };

  const closeProofViewer = () => {
    setViewingProof(null);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <p className="text-gray-500 text-lg">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-blue-800">Companies</h2>
        <Link
          to="/companies/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold shadow-md transition-colors"
        >
          + Add Company
        </Link>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {companies.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No companies found.</p>
          <Link
            to="/companies/add"
            className="mt-4 inline-block text-blue-600 hover:underline font-medium"
          >
            Add your first company
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Logo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Website
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-blue-800 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => {
                  const logoUrl = getLogoUrl(company.logoId);
                  const isDeleting = deleteLoading === company._id;

                  return (
                    <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={`${company.companyName} logo`}
                              className="h-12 w-12 object-cover rounded-full border-2 border-gray-200"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg ${
                              logoUrl ? 'hidden' : ''
                            }`}
                            style={{ display: logoUrl ? 'none' : 'flex' }}
                          >
                            {company.companyName?.charAt(0)?.toUpperCase() || 'C'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {company.companyName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {company.website ? (
                            <a
                              href={company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline truncate block max-w-xs"
                            >
                              Visit
                            </a>
                          ) : (
                            <span className="text-gray-400">Not provided</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {company.location || <span className="text-gray-400">Not specified</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {company.verified ? (
                          <Badge variant="success" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="warning" className="w-fit">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {company.proofDocumentId && (
                            <button
                              onClick={() => handleViewProof(company.proofDocumentId, company.companyName)}
                              className="inline-flex items-center px-3 py-2 border border-green-300 rounded-md text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              title="View Proof Document"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/companies/edit/${company._id}`)}
                            className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            title="Edit Company"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(company._id, company.companyName)}
                            disabled={isDeleting}
                            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete Company"
                          >
                            {isDeleting ? (
                              <span className="text-xs">Deleting...</span>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
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

      {/* Proof Document Viewer Modal */}
      {viewingProof && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={closeProofViewer}>
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Proof Document - {viewingProof.companyName}
              </h3>
              <button
                onClick={closeProofViewer}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {viewingProof.url ? (
                <iframe
                  src={viewingProof.url}
                  className="w-full h-full min-h-[600px] border-0"
                  title="Proof Document"
                  onLoad={() => {
                    console.log('Proof document loaded successfully');
                  }}
                  onError={(e) => {
                    console.error('Error loading proof document:', e);
                    alert('Failed to load proof document. Please check your connection and try again.');
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-96">
                  <p className="text-gray-500">Loading proof document...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
