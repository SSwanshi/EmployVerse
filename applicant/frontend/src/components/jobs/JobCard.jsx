import { Link } from 'react-router-dom';
import { applicantApi } from '../../services/applicantApi';
import { formatTimeAgo } from '../../utils/formatTimeAgo';
import { highlightText } from '../../utils/highlightText';

const JobCard = ({ job, query }) => {
  const companyName = job.jobCompany?.companyName || 'Company Not Available';
  const logoUrl = job.jobCompany?.logoId ? applicantApi.getLogo(job.jobCompany.logoId) : null;
  const jobRequirements = job.jobRequirements ? job.jobRequirements.split('\n').filter(Boolean) : [];
  const jobDescription = job.jobDescription ? job.jobDescription.split('\n').filter(Boolean) : [];
  const expiryDate =
    job.jobExpiry && new Date(job.jobExpiry) > new Date()
      ? new Date(job.jobExpiry).toLocaleDateString('en-GB')
      : 'Expired';

  return (
    <div className="job-card bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md p-5 transition-all duration-300 font-sans flex flex-col justify-between">
      <div>
        {/* Header Title Row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={`${companyName} Logo`}
                  className="h-10 w-10 object-contain rounded-lg"
                />
              ) : (
                <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-slate-400 text-[10px] font-bold">N/A</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-snug tracking-tight">
                {highlightText(job.jobTitle || 'N/A', query)}
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {highlightText(companyName, query)}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end text-right shrink-0">
            <span className="text-xs font-bold text-slate-950 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {highlightText(job.jobLocation || 'N/A', query)}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Posted {formatTimeAgo(job.createdAt)}
            </span>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100/30">
            {highlightText(job.jobType || 'N/A', query)}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100">
            Exp: {job.jobExperience || 0} yrs
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100/30">
            {job.noofPositions || 0} Openings
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-100/30">
            Ends: {expiryDate}
          </span>
        </div>

        {/* Short Truncated Description */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
          {highlightText(job.jobDescription || 'No description provided.', query)}
        </p>
      </div>

      {/* Footer Details */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 mt-auto">
        <div className="text-sm font-black text-slate-900">
          {job.jobSalary ? highlightText(`${job.jobSalary} LPA`, query) : 'Competitive Salary'}
        </div>
        <Link
          to={`/jobs/${job._id}/apply`}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white rounded-lg font-bold text-xs shadow-sm transition-all duration-205 cursor-pointer"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
