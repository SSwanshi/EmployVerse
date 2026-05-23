import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import profileService from "../services/profileService";
import { applicantApi } from "../services/applicantApi";
import { useToast } from "../contexts/ToastContext";

const statusConfig = {
  Pending:  { cls: "bg-amber-50 text-amber-700 border-amber-100",  icon: "fa-clock" },
  Accepted: { cls: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: "fa-check" },
  Rejected: { cls: "bg-rose-50 text-rose-700 border-rose-100",   icon: "fa-times" },
};

const MyApplications = () => {
  const [applicationHistory, setApplicationHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProfileData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setApplicationHistory(data.applicationHistory || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      if (error.response?.status === 401) {
        window.location.href = "/login";
      } else {
        showToast("Failed to load application history", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const counts = {
    total:    applicationHistory.length,
    pending:  applicationHistory.filter(a => a.status === "Pending").length,
    accepted: applicationHistory.filter(a => a.status === "Accepted").length,
    rejected: applicationHistory.filter(a => a.status === "Rejected").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl text-slate-400"></i>
          <p className="mt-3 text-sm text-slate-500">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-7 pb-16 px-6 lg:px-10 font-sans">

      {/* Header */}
      <div className="flex items-end justify-between mb-8 pb-5 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">My applications</h1>
          <p className="text-sm text-slate-500 mt-1">Track and manage all your job applications in one place</p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium text-slate-700 transition-colors shadow-sm"
        >
          <i className="fas fa-briefcase text-xs"></i> Browse jobs
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Total applied", value: counts.total, color: "text-slate-900" },
          { label: "Pending",       value: counts.pending,  color: "text-amber-600" },
          { label: "Accepted",      value: counts.accepted, color: "text-emerald-600" },
          { label: "Rejected",      value: counts.rejected, color: "text-rose-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3.5">
            <p className="text-xs text-slate-400 mb-1.5">{s.label}</p>
            <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Applications grid */}
      {applicationHistory.length > 0 ? (
        <>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-3">All applications</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
            {applicationHistory.map((app, index) => {
              const status = statusConfig[app.status] || statusConfig.Pending;
              const appLogoUrl = app.logoId ? applicantApi.getLogo(app.logoId) : null;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-colors p-5 flex flex-col gap-3.5"
                >
                  {/* Top */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0 overflow-hidden">
                      {appLogoUrl ? (
                        <img src={appLogoUrl} alt={`${app.company} logo`} className="w-full h-full object-contain bg-white" />
                      ) : (
                        app.company?.charAt(0) || "C"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 text-sm leading-snug truncate">{app.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{app.company}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wide">
                      {app.type}
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${status.cls}`}>
                      <i className={`fas ${status.icon} text-[10px]`}></i>
                      {app.status}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 flex items-center gap-1.5">
                        <i className="far fa-calendar-alt text-[11px]"></i>
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <button
                        className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                        onClick={() => showToast("Messaging feature coming soon!", "info")}
                      >
                        <i className="fas fa-comment-dots text-[11px]"></i> Message
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-28">
          <div className="w-16 h-16 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mb-5">
            <i className="fas fa-file-alt text-slate-300 text-2xl"></i>
          </div>
          <h3 className="text-base font-semibold text-slate-800 mb-1.5">No applications yet</h3>
          <p className="text-sm text-slate-500 text-center max-w-xs leading-relaxed mb-6">
            You haven't applied to any jobs or internships yet. Start your search today!
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-medium rounded-xl transition-colors"
          >
            <i className="fas fa-briefcase text-xs"></i> Browse jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyApplications;