import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components-guard/ProtectedRoute';

// Auth Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';

// Main Pages
import Dashboard from '../pages/Dashboard';
import Companies from '../pages/Companies';
import AddCompany from '../pages/AddCompany';
import EditCompany from '../pages/EditCompany';
import Jobs from '../pages/Jobs';
import AddJob from '../pages/AddJob';
import EditJob from '../pages/EditJob';
import Internships from '../pages/Internships';
import AddInternship from '../pages/AddInternship';
import EditInternship from '../pages/EditInternship';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import Applications from '../pages/Applications';
import InternshipApplications from '../pages/InternshipApplications';
import ApplicantProfile from '../pages/ApplicantProfile';
import ChangePassword from '../pages/ChangePassword';
import NotFound from '../pages/NotFound';
import Upgrade from '../pages/Upgrade';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
        {/* Auth Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        } />

        {/* Public Pages */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/privacy-policy" element={<Privacy />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/add" element={<AddCompany />} />
          <Route path="companies/edit/:id" element={<EditCompany />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/add" element={<AddJob />} />
          <Route path="jobs/edit/:id" element={<EditJob />} />
          <Route path="jobs/:jobId/applications" element={<Applications />} />
          <Route path="applicant/:applicantId" element={<ApplicantProfile />} />
          <Route path="internships" element={<Internships />} />
          <Route path="internships/add" element={<AddInternship />} />
          <Route path="internships/edit/:id" element={<EditInternship />} />
          <Route path="internships/:internshipId/applications" element={<InternshipApplications />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="profile/change-password" element={<ChangePassword />} />
          <Route path="upgrade" element={<Upgrade />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

