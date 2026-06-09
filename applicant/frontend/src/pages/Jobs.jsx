import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applicantApi } from "../services/applicantApi";
import recommendationService from "../services/recommendationService";
import { useToast } from "../contexts/ToastContext";
import Header from "../components/common/Header";
import EmptyState from "../components/common/EmptyState";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import Pagination from "../components/jobs/Pagination";
import JobCardSkeleton from "../components/jobs/JobCardSkeleton";
import RecommendedJobsList from "../components/jobs/RecommendedJobsList";

const Jobs = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [isShowingRecommendations, setIsShowingRecommendations] = useState(false);

  const fetchJobs = async () => {
      try {
        // Build query string from both filters and pagination
        const params = new URLSearchParams();
        
        // Add pagination
        params.set("page", page);
        
        // Add filters
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.set(key, value);
          }
        });

        const queryString = params.toString();
        const data = await applicantApi.getJobs(queryString);
        setJobs(data.jobs);
        setTotalPages(data.meta.totalPages);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (!isShowingRecommendations) {
      fetchJobs();
    }
  }, [filters, page, isShowingRecommendations]); 

  const handleGetRecommendations = async () => {
    try {
      setIsRecommending(true);
      setLoading(true);
      const data = await recommendationService.getJobRecommendations();
      if (data && data.recommendedJobs) {
        setJobs(data.recommendedJobs);
        setTotalPages(1); // Recommendations are a single page
        setIsShowingRecommendations(true);
        toast.success("Loaded personalized job recommendations!");
      }
    } catch (error) {
      console.error("Recommendation error:", error);
      const msg = error.response?.data?.error || "Please upload and analyze your resume on the Profile page first.";
      toast.error(msg);
    } finally {
      setIsRecommending(false);
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters) => {
    // Reset to page 1 when filters change
    setPage(1);
    setIsShowingRecommendations(false); // Clear recommendations when filtering
    setFilters(newFilters);
  };

  return (
    <div>
      <Header title="Available Jobs" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        
        {!isShowingRecommendations && (
          <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Get Personalized Job Matches</h2>
              <p className="text-slate-600 text-sm">We'll analyze your uploaded resume and recommend the best jobs for your skills and experience.</p>
            </div>
            <button
              onClick={handleGetRecommendations}
              disabled={isRecommending}
              className="shrink-0 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex flex-col items-center"
            >
              {isRecommending ? 'Analyzing Resume...' : 'Job Recommendation'}
              {!isRecommending && <span className="text-[10px] text-blue-100 opacity-90">(Analysed from your resume)</span>}
            </button>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Mobile Filter Button */}
          <div className="lg:hidden flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-slate-900">All Jobs</h2>
            <button 
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-black transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
            </button>
          </div>

          {/* Filters - left column (Desktop) */}
          <div className="hidden lg:block w-full lg:w-1/4">
            <JobFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Filters - Mobile Dialog */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div 
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={() => setIsMobileFilterOpen(false)}
              ></div>
              <div className="relative flex flex-col w-full max-w-xs h-full bg-slate-50 shadow-2xl ml-auto transition-transform duration-300 transform translate-x-0">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                  <button 
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 pb-20">
                  <JobFilters onFiltersChange={(filters) => {
                     handleFiltersChange(filters);
                     setIsMobileFilterOpen(false);
                  }} />
                </div>
              </div>
            </div>
          )}

          {/* Job list - right column */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="flex flex-col gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            ) : isShowingRecommendations ? (
              <RecommendedJobsList 
                jobs={jobs} 
                onBack={() => {
                  setIsShowingRecommendations(false);
                  setPage(1);
                  setFilters({});
                }} 
              />
            ) : jobs.length === 0 ? (
              <EmptyState message="No jobs available at the moment" />
            ) : (
              <div className="flex flex-col gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
                <Pagination 
                  totalPages={totalPages} 
                  page={page} 
                  onPageChange={handlePageChange} 
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;