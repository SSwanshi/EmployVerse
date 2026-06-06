import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { getStoredToken } from '../services/api';
import { FileText, MessageSquare } from 'lucide-react';
import { formatDate } from '../utils/formatDate';

const SelectedApplicants = () => {
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
  const token = getStoredToken();

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchSelectedApplicants();
  }, []);

  const fetchSelectedApplicants = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/api/applications/selected/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSelectedApplicants(response.data.selectedApplicants || []);
      } else {
        setError(response.data.message || 'Failed to fetch selected applicants');
      }
    } catch (err) {
      console.error('Error fetching selected applicants:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const getResumeUrl = (app) => {
    if (!app.resumeId) return null;
    const route = app.type === 'Job' ? 'applications' : 'internapplicants';
    return `${API_BASE}/api/${route}/${app.opportunityId}/resume/${app.resumeId}?token=${encodeURIComponent(token)}`;
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-50 min-h-screen pt-24 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Selected Applications</h2>
            <p className="text-slate-500 mt-1 text-sm font-medium">Manage and chat with candidates whose applications have been shortlisted.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden animate-pulse">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <th key={i} className="px-6 py-4 text-left"><div className="h-4 bg-slate-700 rounded w-20"></div></th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row}>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((col) => (
                        <td key={col} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-slate-200 rounded w-full max-w-[100px]"></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen pt-24 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Selected Applications
          </h2>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            Manage and chat with candidates whose applications have been shortlisted.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-semibold">
            {error}
          </div>
        )}

        {selectedApplicants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-150/60 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-slate-300" />
            </div>
            <h3 className="text-md font-bold text-slate-800 mb-1">No Selected Applicants</h3>
            <p className="text-slate-500 text-xs font-semibold max-w-sm mx-auto mb-6">
              You haven't selected any applicants yet. Go to your Job or Internship Applications to shortlist candidates.
            </p>
            <Link
              to="/jobs"
              className="inline-flex items-center px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-sm transition duration-200"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-150/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Company Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Opportunity Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Applicant Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">
                      Chat
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {selectedApplicants.map((app) => (
                    <tr
                      key={app.applicationId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {app.companyName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-800">{app.title}</div>
                        <span className="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-650 border border-slate-200 mt-1 uppercase tracking-wide">
                          {app.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-800">
                        {app.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                        <a href={`mailto:${app.email}`} className="hover:underline text-slate-800">
                          {app.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-semibold">
                        <a href={`tel:${app.phone}`} className="hover:underline text-slate-800">
                          {app.phone}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-semibold">
                        {formatDate(app.appliedDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {app.resumeId ? (
                          <a
                            href={getResumeUrl(app)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-slate-800 hover:text-blue-600 text-xs font-bold hover:underline"
                          >
                            <FileText className="h-4 w-4 mr-1.5 text-slate-400" />
                            View Resume
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold">No resume</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link
                          to={`/chat/${app.applicationId}`}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-900 hover:bg-black text-white transition duration-150 shadow-sm border border-slate-900"
                          title="Message Applicant"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedApplicants;
