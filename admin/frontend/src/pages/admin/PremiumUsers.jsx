import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import PremiumUserTable from '../../components-admin/PremiumUserTable';
import Header from '../../components/common/Header';

const PremiumUsers = () => {
  const [premiumUsers, setPremiumUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPremiumUsers();
  }, []);

  const fetchPremiumUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getPremiumUsers();
      setPremiumUsers(data);
    } catch (err) {
      setError('Failed to fetch premium users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Premium Users" />
        <div className="text-center py-12">Loading premium users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Header title="Premium Users" />
        <div className="text-center py-12 text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Premium Users" />
      <div className="mt-6">
        <PremiumUserTable premiumUsers={premiumUsers} />
      </div>
    </div>
  );
};

export default PremiumUsers;
