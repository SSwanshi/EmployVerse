import { useAuth } from '../../hooks/useAuth';
import CompaniesAwaitingVerification from './CompaniesAwaitingVerification';

const VerificationManagerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome {user?.name || user?.email?.split('@')[0]}
        </h2>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <CompaniesAwaitingVerification />
      </div>
    </div>
  );
};

export default VerificationManagerDashboard;
