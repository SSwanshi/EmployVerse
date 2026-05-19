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
    <div className="job-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Job Title Row */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          {/* Company Logo */}
          <div className="bg-gray-100 p-1.5 rounded-lg">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={`${companyName} Logo`}
                className="h-12 w-12 object-contain rounded-md"
              />
            ) : (
              <div className="h-12 w-12 bg-gray-300 rounded-md flex items-center justify-center">
                <span className="text-gray-500 text-xs font-bold">N/A</span>
              </div>
            )}
          </div>

          {/* Job Title and Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {highlightText(job.jobTitle || 'N/A', query)}
            </h3>
            <div className="flex flex-wrap items-center gap-1 text-sm text-gray-600">
              <span className="font-semibold">
                {highlightText(companyName, query)}
              </span>
              <span>•</span>
              <span className="inline-block px-3 py-1 text-sm font-medium text-orange-500 bg-orange-100 rounded-full">
                {highlightText(job.jobType || 'N/A', query)}
              </span>
              <span className="inline-block px-3 py-1 text-sm font-medium text-purple-500 bg-purple-100 rounded-full">
                {highlightText(`Experience: ${job.jobExperience || 0} years`, query)}
              </span>
              <span className="inline-block px-3 py-1 text-sm font-medium text-green-500 bg-green-100 rounded-full">
                {highlightText(`Positions: ${job.noofPositions || 0}`, query)}
              </span>
              <span className="inline-block px-3 py-1 text-sm font-medium text-red-500 bg-red-100 rounded-full">
                {highlightText(`Expiry: ${expiryDate}`, query)}
              </span>
            </div>
          </div>
        </div>

        {/* Location and Time */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-lg font-semibold text-gray-900">
              {highlightText(job.jobLocation || 'N/A', query)}
            </span>
          </div>
          <span>Posted {formatTimeAgo(job.createdAt)}</span>
        </div>
      </div>

      {/* Job Requirements */}
      {jobRequirements.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1.5 pl-1">
          {jobRequirements.map((req, i) => (
            <li key={i} className="leading-snug">
              {highlightText(req.trim(), query)}
            </li>
          ))}
        </ul>
      )}

      {/* Job Description */}
      {jobDescription.length > 0 && (
        <ul className="text-sm text-gray-600 list-disc list-inside mb-4 space-y-1.5 pl-1">
          {jobDescription.map((desc, i) => (
            <li key={i} className="leading-snug">
              {highlightText(desc.trim(), query)}
            </li>
          ))}
        </ul>
      )}

      {/* Salary and Apply */}
      <div className="flex items-center justify-between border-t pt-4">
        {job.jobSalary && (
          <div className="text-sm font-medium text-gray-800">
            {highlightText(`${job.jobSalary} LPA`, query)}
          </div>
        )}
        <Link
          to={`/jobs/${job._id}/apply`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Apply Now
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
