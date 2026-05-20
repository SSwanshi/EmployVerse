import { useEffect, useState } from 'react';
import { applicantApi } from '../services/applicantApi';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';
import InternshipCard from '../components/internships/InternshipCard';
import InternshipFilters from '../components/internships/InternshipFilters';
import Pagination from '../components/jobs/Pagination';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleFiltersChange = (newFilters) => {
    setPage(1);
    setFilters(newFilters);
  };

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        const params = new URLSearchParams();
        params.set("page", page);

        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.set(key, value);
          }
        });

        const queryString = params.toString();
        const data = await applicantApi.getInternships(queryString);
        setTotalPages(data.meta.totalPages);
        setInternships(data.internships);
      } catch (error) {
        console.error('Error fetching internships:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInternships();
  }, [filters, page]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const handlePageChange = (newpage) => {
    setPage(newpage);
  }

  return (
    <div>
      <Header title="Available Internships" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-slate-900">All Internships</h2>
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

        {/* Filters Left (Desktop) */}
        <div className="hidden lg:block w-full lg:w-1/4">
          <InternshipFilters onFiltersChange={handleFiltersChange} />
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
                <InternshipFilters onFiltersChange={(filters) => {
                   handleFiltersChange(filters);
                   setIsMobileFilterOpen(false);
                }} />
              </div>
            </div>
          </div>
        )}

        {/* Internship List Right */}
        <div className="flex-1">
          {internships.length === 0 ? (
            <EmptyState message="No internships available at the moment" />
          ) : (
            <div className="flex flex-col gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} />
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
  );
};

export default Internships;
