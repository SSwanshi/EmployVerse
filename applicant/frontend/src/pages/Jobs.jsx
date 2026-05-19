import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { applicantApi } from "../services/applicantApi";
import Header from "../components/common/Header";
import EmptyState from "../components/common/EmptyState";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";
import Pagination from "../components/jobs/Pagination";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
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
    
    fetchJobs();
  }, [filters, page]); // Trigger when either filters or page changes

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleFiltersChange = (newFilters) => {
    // Reset to page 1 when filters change
    setPage(1);
    setFilters(newFilters);
  };

  return (
    <div>
      <Header title="Available Jobs" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - left column */}
          <div className="w-full lg:w-1/4">
            <JobFilters onFiltersChange={handleFiltersChange} />
          </div>

          {/* Job list - right column */}
          <div className="w-full lg:w-3/4">
            {jobs.length === 0 ? (
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