import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/guard/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import ApplicantList from '../pages/admin/ApplicantList';
import RecruiterList from '../pages/admin/RecruiterList';
import CompanyList from '../pages/admin/CompanyList';
import JobList from '../pages/admin/JobList';
import InternshipList from '../pages/admin/InternshipList';
import PremiumUsers from '../pages/admin/PremiumUsers';
import CompaniesAwaitingVerification from '../pages/admin/CompaniesAwaitingVerification';
import { useAuth } from '../hooks/useAuth';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applicants" element={<ApplicantList />} />
          <Route path="recruiters" element={<RecruiterList />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/awaiting-verification" element={<CompaniesAwaitingVerification />} />
          <Route path="jobs" element={<JobList />} />
          <Route path="internships" element={<InternshipList />} />
          <Route path="premium-users" element={<PremiumUsers />} />
        </Route>

        {/* Catch all - redirect to dashboard or login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
