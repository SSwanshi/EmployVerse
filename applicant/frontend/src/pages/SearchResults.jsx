import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/jobs/JobCard';
import InternshipCard from '../components/internships/InternshipCard';
import JobFilters from '../components/jobs/JobFilters';
import InternshipFilters from '../components/internships/InternshipFilters';
/** Apply same filter logic as backend: salaryMin (LPA), expMin/expMax (years), location */
function filterJobs(jobsList, filters) {
  if (!jobsList?.length) return [];
  if (!filters || Object.keys(filters).every((k) => filters[k] === undefined || filters[k] === '' || (Array.isArray(filters[k]) && filters[k].length === 0))) {
    return jobsList;
  }
  return jobsList.filter((job) => {
    if (filters.salaryMin != null && Number(filters.salaryMin) > 0) {
      const minSal = Number(filters.salaryMin);
      if (job.jobSalary == null || job.jobSalary < minSal) return false;
    }
    if (filters.expMin != null && filters.expMin !== '') {
      const expMin = Number(filters.expMin);
      if (job.jobExperience == null || job.jobExperience < expMin) return false;
    }
    if (filters.expMax != null && filters.expMax !== '') {
      const expMax = Number(filters.expMax);
      if (job.jobExperience == null || job.jobExperience > expMax) return false;
    }
    if (filters.location && String(filters.location).trim()) {
      const loc = String(filters.location).trim().toLowerCase();
      const jobLoc = (job.jobLocation || '').toLowerCase();
      if (!jobLoc.includes(loc)) return false;
    }
    return true;
  });
}

/** Apply same filter logic as backend: stipendMin (K), durationMin/durationMax (months), location */
function filterInternships(internshipsList, filters) {
  if (!internshipsList?.length) return [];
  if (!filters || Object.keys(filters).every((k) => filters[k] === undefined || filters[k] === '' || (Array.isArray(filters[k]) && filters[k].length === 0))) {
    return internshipsList;
  }
  return internshipsList.filter((int) => {
    if (filters.stipendMin != null && Number(filters.stipendMin) > 0) {
      const minStipendRupees = Number(filters.stipendMin) * 1000;
      if (int.intStipend == null || int.intStipend < minStipendRupees) return false;
    }
    if (filters.durationMin != null && filters.durationMin !== '') {
      const durationMin = Number(filters.durationMin);
      const durationMonths = int.intDuration != null ? int.intDuration : int.intExperience;
      if (durationMonths == null || durationMonths < durationMin) return false;
    }
    if (filters.durationMax != null && filters.durationMax !== '') {
      const durationMax = Number(filters.durationMax);
      const durationMonths = int.intDuration != null ? int.intDuration : int.intExperience;
      if (durationMonths == null || durationMonths > durationMax) return false;
    }
    if (filters.location && String(filters.location).trim()) {
      const loc = String(filters.location).trim().toLowerCase();
      const intLoc = (int.intLocation || '').toLowerCase();
      if (!intLoc.includes(loc)) return false;
    }
    return true;
  });
}

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobFilters, setJobFilters] = useState({});
  const [internshipFilters, setInternshipFilters] = useState({});
  /** From API when backend includes it (`solr` | `fuse`); null if older server omits it */
  const [searchEngine, setSearchEngine] = useState(null);

  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('q') || location.state?.query || '';
  }, [location.search, location.state]);

  const filteredJobs = useMemo(
    () => filterJobs(jobs, jobFilters),
    [jobs, jobFilters]
  );

  const filteredInternships = useMemo(
    () => filterInternships(internships, internshipFilters),
    [internships, internshipFilters]
  );

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);
        setSearchEngine(null);

        const response = await api.post('/search', {
          parsedValue: query,
        });

        setJobs(response.data.jobs || []);
        setInternships(response.data.internships || []);
        if (response.data.engine != null) {
          setSearchEngine(response.data.engine);
        }
      } catch (err) {
        setError(
          err.response?.data?.error ||
          'Something went wrong while fetching search results.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const totalJobs = jobs.length;
  const totalInternships = internships.length;
  const hasResults = totalJobs > 0 || totalInternships > 0;

  const handleNewSearch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newQuery = formData.get('q')?.toString().trim() || '';

    if (!newQuery) return;

    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-12 font-sans">
      <section className="pt-8 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <p className="text-slate-600 font-bold text-md animate-pulse">Loading search results...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center justify-center py-16">
            <div className="bg-white rounded-2xl border border-red-100 p-8 max-w-xl text-center shadow-sm">
              <h2 className="text-lg font-extrabold text-red-650 mb-2">
                Failed to load results
              </h2>
              <p className="text-slate-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && query && hasResults && (
          <>
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                Search Results for <span className="text-blue-600">"{query}"</span>
              </h1>
              <p className="text-slate-500 text-sm font-semibold">
                Found {totalJobs} job{totalJobs !== 1 ? 's' : ''}
                {totalJobs > 0 && totalInternships > 0 && ' and '}
                {totalInternships} internship
                {totalInternships !== 1 ? 's' : ''}
              </p>
              {searchEngine && (
                <p className="text-xs text-slate-400 mt-2 font-semibold">
                  Search backend:{' '}
                  <span className="font-mono font-bold text-slate-650">{searchEngine}</span>
                </p>
              )}
            </div>

            {/* Tabs */}
            <div className="flex justify-center mb-10">
              <div className="inline-flex bg-slate-200/50 p-1.5 rounded-2xl" role="group">
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === 'jobs'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Jobs ({totalJobs})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('internships')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                    activeTab === 'internships'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  Internships ({totalInternships})
                </button>
              </div>
            </div>

            {/* Jobs Section */}
            {activeTab === 'jobs' && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
                  <JobFilters onFiltersChange={setJobFilters} />
                </div>
                <div className="w-full lg:w-3/4 space-y-6">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                    Job Opportunities
                    {filteredJobs.length !== totalJobs && (
                      <span className="ml-2.5 text-xs font-semibold text-slate-400">
                        (showing {filteredJobs.length} of {totalJobs})
                      </span>
                    )}
                  </h2>

                  {filteredJobs.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                      {filteredJobs.map((job) => (
                        <div key={job._id} className="fade-in">
                          <JobCard job={job} query={query} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
                      <h3 className="text-base font-extrabold text-slate-850 mb-2">
                        {totalJobs > 0
                          ? 'No jobs match the current filters'
                          : `No jobs found matching "${query}"`}
                      </h3>
                      <p className="text-slate-500 text-xs font-semibold">
                        {totalJobs > 0 ? (
                          <>Try adjusting the filters or clear them to see all {totalJobs} result{totalJobs !== 1 ? 's' : ''}.</>
                        ) : (
                          <>
                            Try adjusting your search or browse our{' '}
                            <button
                              type="button"
                              onClick={() => navigate('/jobs')}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              job listings
                            </button>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Internships Section */}
            {activeTab === 'internships' && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                <div className="w-full lg:w-1/4 lg:sticky lg:top-24">
                  <InternshipFilters onFiltersChange={setInternshipFilters} />
                </div>
                <div className="w-full lg:w-3/4 space-y-6">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center">
                    Internship Opportunities
                    {filteredInternships.length !== totalInternships && (
                      <span className="ml-2.5 text-xs font-semibold text-slate-400">
                        (showing {filteredInternships.length} of {totalInternships})
                      </span>
                    )}
                  </h2>

                  {filteredInternships.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                      {filteredInternships.map((internship) => (
                        <div key={internship._id} className="fade-in">
                          <InternshipCard internship={internship} query={query} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
                      <h3 className="text-base font-extrabold text-slate-850 mb-2">
                        {totalInternships > 0
                          ? 'No internships match the current filters'
                          : `No internships found matching "${query}"`}
                      </h3>
                      <p className="text-slate-500 text-xs font-semibold">
                        {totalInternships > 0 ? (
                          <>Try adjusting the filters or clear them to see all {totalInternships} result{totalInternships !== 1 ? 's' : ''}.</>
                        ) : (
                          <>
                            Try adjusting your search or browse our{' '}
                            <button
                              type="button"
                              onClick={() => navigate('/internships')}
                              className="text-blue-600 hover:underline font-bold"
                            >
                              internship listings
                            </button>
                            .
                          </>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !error && query && !hasResults && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                No Results Found
              </h2>
              <p className="text-sm text-slate-500 mb-6 font-semibold leading-relaxed">
                We couldn&apos;t find any jobs or internships matching{' '}
                <span className="font-bold text-blue-600">"{query}"</span>.
              </p>
              <button
                type="button"
                onClick={() => navigate('/jobs')}
                className="inline-block px-6 py-3 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold shadow-md transition-all duration-300 cursor-pointer"
              >
                Browse All Opportunities
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !query && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="max-w-md mx-auto bg-white rounded-2xl border border-slate-100 p-10 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">
                Start your search
              </h2>
              <p className="text-slate-500 text-xs font-semibold">
                Enter a keyword above to find jobs and internships.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SearchResults;