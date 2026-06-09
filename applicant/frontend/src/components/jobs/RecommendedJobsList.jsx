import JobCard from "./JobCard";
import EmptyState from "../common/EmptyState";

const RecommendedJobsList = ({ jobs, onBack }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Recommended Jobs</h2>
          <p className="text-slate-600 text-sm">Based on your resume analysis</p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          &larr; Back to all jobs
        </button>
      </div>

      {jobs.length === 0 ? (
        <EmptyState message="No match found" />
      ) : (
        <div className="flex flex-col gap-6">
          {jobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobsList;
