import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components-guard/ProtectedRoute';

// Auth Pages
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';

// Main Pages
import Home from '../pages/Home';
import Jobs from '../pages/Jobs';
import Internships from '../pages/Internships';
import Companies from '../pages/Companies';
import Profile from '../pages/Profile';
import EditProfile from '../pages/EditProfile';
import Payment from '../pages/Payment';
import Receipt from '../pages/Receipt';
import Subscription from '../pages/Subscription';
import AppliedJobs from '../pages/AppliedJobs';
import AppliedInternships from '../pages/AppliedInternships';
import Dashboard from '../pages/Dashboard';
import ApplyJob from '../pages/ApplyJob';
import ApplyInternship from '../pages/ApplyInternship';
import SearchResults from '../pages/SearchResults';
import Terms from '../pages/Terms';
import Privacy from '../pages/Privacy';
import Contact from '../pages/ContactUs';
import Error from '../pages/Error';
import NotFound from '../pages/NotFound';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
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

        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="internships" element={<Internships />} />
          <Route path="companies" element={<Companies />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="terms" element={<Terms />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="contact" element={<Contact />} />
          <Route path="payment" element={<Payment />} />
          <Route path="receipt" element={<Receipt />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<EditProfile />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="applied-jobs" element={<AppliedJobs />} />
          <Route path="applied-internships" element={<AppliedInternships />} />
          <Route path="jobs/:jobId/apply" element={<ApplyJob />} />
          <Route path="internships/:internshipId/apply" element={<ApplyInternship />} />
        </Route>

        {/* Error Routes */}
        <Route path="/error" element={<Error />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;

