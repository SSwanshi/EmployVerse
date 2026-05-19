import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../services/applicationsApi';
import { AuthContext } from '../contexts/AuthContext';
import { Briefcase, Users, TrendingUp, CheckCircle, BadgeCheck, Star, Crown } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationData, setApplicationData] = useState({
    jobApplications: [],
    internshipApplications: []
  });
  const [selectionData, setSelectionData] = useState({
    jobSelections: [],
    internshipSelections: []
  });

  const { user, isAuthenticated } = useContext(AuthContext);

  // Helper function to group data by date
  const groupByDate = () => {
    const last6Months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Mock data for demonstration
      const count = Math.floor(Math.random() * 15) + 5;
      
      last6Months.push({
        period: monthName,
        count: count
      });
    }
    
    return last6Months;
  };

  useEffect(() => {
    const fetchStatistics = async () => { 
      try {
        const data = await applicationsApi.getStatistics();
        setStatistics(data);
        
        // Mock application and selection data
        setApplicationData({
          jobApplications: Array(50).fill().map(() => ({
            appliedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          })),
          internshipApplications: Array(30).fill().map(() => ({
            appliedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          }))
        });
        
        setSelectionData({
          jobSelections: Array(15).fill().map(() => ({
            selectedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          })),
          internshipSelections: Array(8).fill().map(() => ({
            selectedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
          }))
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatistics();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Generate chart data
  const jobApplications = groupByDate(applicationData.jobApplications, 'jobApplication');
  const internshipApplications = groupByDate(applicationData.internshipApplications, 'internshipApplication');
  const jobSelections = groupByDate(selectionData.jobSelections, 'jobSelection');
  const internshipSelections = groupByDate(selectionData.internshipSelections, 'internshipSelection');

  // Application Chart Configuration
  const applicationChartData = {
    labels: jobApplications.map(item => item.period),
    datasets: [
      {
        label: 'Job Applications',
        data: jobApplications.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Internship Applications',
        data: internshipApplications.map(item => item.count),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 1,
      },
    ],
  };

  const applicationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Application Trends - Jobs vs Internships (Last 6 Months)',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Applications'
        }
      },
    },
  };

  // Selection Chart Configuration
  const selectionChartData = {
    labels: jobSelections.map(item => item.period),
    datasets: [
      {
        label: 'Job Selections',
        data: jobSelections.map(item => item.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Internship Selections',
        data: internshipSelections.map(item => item.count),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1,
      },
    ],
  };

  const selectionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Selection Success - Jobs vs Internships (Last 6 Months)',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Time Period'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Selections'
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-yellow-400 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute top-1/4 -left-1/4 w-80 h-80 bg-yellow-300 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-yellow-500 rounded-full opacity-15 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-8">
              <div className="inline-flex items-center bg-yellow-400 text-blue-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="w-2 h-2 bg-blue-900 rounded-full mr-2"></span>
                Recruiter Dashboard
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight whitespace-nowrap">
                <span className="inline-flex items-center">
                  Welcome
                  <span className="text-yellow-400 ml-3 inline-flex items-center">
                    {user.firstName}
                    {isAuthenticated ? (
                      <BadgeCheck className='text-yellow-400 ml-2 w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 flex-shrink-0' />
                    ) : (null)}
                  </span>
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-blue-100 leading-relaxed">
                Streamline your hiring process with our powerful recruiter tools.
                Effortlessly manage job postings, track applicants, and maintain
                company profiles—all in one place.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm text-white px-5 h-12 rounded-full border border-white border-opacity-20 whitespace-nowrap">
                  <CheckCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-blue-900 font-bold">Easy Management</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm text-white px-5 h-12 rounded-full border border-white border-opacity-20 whitespace-nowrap">
                  <CheckCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-blue-900 font-bold">Real-time Tracking</span>
                </div>
                <div className="flex items-center bg-white bg-opacity-10 backdrop-blur-sm text-white px-5 h-12 rounded-full border border-white border-opacity-20 whitespace-nowrap">
                  <CheckCircle className="w-5 h-5 mr-2 text-yellow-400" />
                  <span className="text-blue-900 font-bold">All-in-One Platform</span>
                </div>
                <div>
                {user?.isPremium ? (
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 font-semibold px-4 py-3 rounded-full shadow-lg">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-yellow-400">
                      <Crown className="w-4 h-4" />
                    </span>
                    <span>Pro Recruiter</span>
                  </div>
                ) : (
                  <Link to="/upgrade" className="inline-flex items-center gap-3 bg-yellow-400 text-blue-900 font-semibold px-4 py-3 rounded-full shadow-lg hover:bg-yellow-300 transition">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-white">
                      <Star className="w-4 h-4" />
                    </span>
                    <span>Upgrade to Pro</span>
                  </Link>
                )}
              </div>
              </div>

              {/* Upgrade CTA */}
              
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block ml-[70px]">
              <div className="relative">
                {/* Main Image */}
                <div className="rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-105">
                  <img
                    src="https://www.aihr.com/wp-content/uploads/recruiter-job-description-cover.jpg"
                    alt="Recruiter at work"
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <section class="py-16 bg-white">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center text-blue-800 mb-12">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Link to="/jobs/add" class="flex flex-col items-center p-6 blue-bg rounded-xl hover:bg-yellow-300 transition-colors duration-300 hover-grow bg-blue-200">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span class="font-medium font-bold">Add New Job</span>
        </Link>
        <Link to="/companies/add" class="flex flex-col items-center p-6 blue-bg rounded-xl hover:bg-yellow-300 transition-colors duration-300 hover-grow bg-blue-200">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span class="font-medium font-bold">Add New Company</span>
        </Link>
        <Link to="/internships/add" class="flex flex-col items-center p-6 blue-bg rounded-xl hover:bg-yellow-300 transition-colors duration-300 hover-grow bg-blue-200">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V6a4 4 0 018 0v1m4 0a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h16zM10 12h4" />
            </svg>
          </div>
          <span class="font-medium font-bold">Add New Internship</span>
        </Link>
      </div>
    </div>
  </section>

  <section class="py-16 blue-bg">
    <div class="container px-4">
        <h2 class="text-3xl font-bold text-center text-blue-800 mb-12">Powerful Recruiting Tools</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div class="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover-grow border-t-4 border-blue-600 max-w-md mx-auto">
                <div class="h-48 overflow-hidden">
                    <img src="https://cdn.pixabay.com/photo/2019/01/19/19/22/recruitment-3942378_640.jpg" 
                        alt="Job Management" 
                        class="w-full h-full object-cover rounded-none"/>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold text-blue-700 mb-2">Job Management</h3>
                    <p class="mb-3 text-sm">Create, edit, and manage all your job postings in one centralized dashboard.</p>
                    <Link to="/jobs" class="text-blue-600 font-medium hover:text-blue-800 text-sm">Manage Jobs →</Link>
                </div>
            </div>

            <div class="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover-grow border-t-4 border-blue-600 max-w-md mx-auto">
              <div class="h-48 overflow-hidden">
                  <img src="https://www.foundit.in/career-advice/wp-content/uploads/2022/03/interview-question-and-answer-for-hr-recruiter-1068x559.jpg" 
                      alt="Job Management" 
                      class="w-full h-full object-cover rounded-none"/>
              </div>
              <div class="p-4">
                  <h3 class="text-lg font-bold text-blue-700 mb-2">Internship Management</h3>
                  <p class="mb-3 text-sm">Create, edit, and manage all your internship postings in one centralized dashboard.</p>
                  <Link to="/internships" class="text-blue-600 font-medium hover:text-blue-800 text-sm">Manage Internships →</Link>
              </div>
          </div>

            <div class="bg-white shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 hover-grow border-t-4 border-yellow-400 max-w-md mx-auto">
                <div class="h-48 overflow-hidden">
                    <img src="https://www.shutterstock.com/image-vector/real-estate-developer-entrepreneur-concept-600nw-487692952.jpg" alt="Company Profiles" class="w-full h-full object-cover rounded-none"/>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-bold text-blue-700 mb-2">Company Profiles</h3>
                    <p class="mb-3 text-sm">Maintain detailed company information and branding for all your clients.</p>
                    <Link to="/companies" class="text-blue-600 font-medium hover:text-blue-800 text-sm">Manage Companies →</Link>
                </div>
            </div>
        </div>
    </div>
</section>

      {/* Analytics Charts Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Analytics Dashboard</h2>
        
        {/* Application Trends Chart */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-80">
              <Bar data={applicationChartData} options={applicationChartOptions} />
            </div>
          </div>
        </div>

        {/* Selection Success Chart */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="h-80">
              <Bar data={selectionChartData} options={selectionChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 border-t-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Companies</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-blue-600">{statistics.companyCount}</p>
              <p className="text-sm text-gray-500 mt-2">Active organizations</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 border-t-4 border-yellow-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Jobs</h3>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{statistics.jobCount}</p>
              <p className="text-sm text-gray-500 mt-2">Open positions</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 transition-transform duration-300 hover:-translate-y-2 border-t-4 border-blue-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Internships</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
              </div>
              <p className="text-4xl font-bold text-blue-700">{statistics.internshipCount}</p>
              <p className="text-sm text-gray-500 mt-2">Training opportunities</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;