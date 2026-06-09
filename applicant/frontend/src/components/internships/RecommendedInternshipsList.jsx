import InternshipCard from "./InternshipCard";
import EmptyState from "../common/EmptyState";

const RecommendedInternshipsList = ({ internships, onBack }) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Recommended Internships</h2>
          <p className="text-slate-600 text-sm">Based on your resume analysis</p>
        </div>
        <button
          onClick={onBack}
          className="shrink-0 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          &larr; Back to all internships
        </button>
      </div>

      {internships.length === 0 ? (
        <EmptyState message="No match found" />
      ) : (
        <div className="flex flex-col gap-6">
          {internships.map((internship) => (
            <InternshipCard key={internship._id} internship={internship} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedInternshipsList;
