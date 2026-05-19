import { useEffect, useState } from 'react';
import { applicantApi } from '../services/applicantApi';
import Header from '../components/common/Header';
import EmptyState from '../components/common/EmptyState';
import CompanyCard from '../components/companies/CompanyCard';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await applicantApi.getCompanies();
        setCompanies(data);
      } catch (error) {
        console.error('Error fetching companies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div>
      <Header title="Companies" />
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {companies.length === 0 ? (
          <EmptyState message="No companies available at the moment" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;

