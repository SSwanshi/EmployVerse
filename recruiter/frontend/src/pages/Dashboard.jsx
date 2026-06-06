import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../services/applicationsApi';
import { AuthContext } from '../contexts/AuthContext';
import { Briefcase, Users, TrendingUp, CheckCircle, BadgeCheck, Star, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
import DashboardSkeleton from '../components/common/DashboardSkeleton';

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

  // Shine effect styles
  const shineStyle = `
    @keyframes shine {
      0% {
        background-position: -1000px 0;
      }
      100% {
        background-position: 1000px 0;
      }
    }
    .shine-effect {
      background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
      background-size: 1000px 100%;
      animation: shine 3s infinite;
    }
  `;

  // Helper function to group data by date
  const groupByDate = (data) => {
    const displayMonths = [];
    
    // Start from June 2026 (month index 5)
    const startYear = 2026;
    const startMonth = 5; 
    
    // Generate 12 months starting from June 2026
    for (let i = 0; i < 12; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const targetMonth = date.getMonth();
      const targetYear = date.getFullYear();

      const count = data?.filter(item => {
        let itemDate;
        if (item.createdAt) itemDate = new Date(item.createdAt);
        else if (item.appliedAt) itemDate = new Date(item.appliedAt);
        else if (item.selectedAt) itemDate = new Date(item.selectedAt);
        else return false;
        
        return itemDate.getMonth() === targetMonth && itemDate.getFullYear() === targetYear;
      }).length || 0;
      
      displayMonths.push({
        period: monthName,
        count: count
      });
    }
    
    return displayMonths;
  };

  useEffect(() => {
    const fetchStatistics = async () => { 
      try {
        const data = await applicationsApi.getStatistics();
        setStatistics(data);
        
        // Set application and selection data from backend
        const jobApps = data.jobApplications || [];
        const intApps = data.internshipApplications || [];

        setApplicationData({
          jobApplications: jobApps,
          internshipApplications: intApps
        });
        
        setSelectionData({
          jobSelections: jobApps.filter(a => a.isSelected),
          internshipSelections: intApps.filter(a => a.isSelected)
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
    return <DashboardSkeleton />;
  }

  const handleAddJobClick = (e) => {
    if (!user?.isPremium && statistics?.jobCount >= 1) {
      e.preventDefault();
      toast.error("Free users can only post 1 job. Upgrade to Pro for unlimited job posts!");
    }
  };

  const handleAddCompanyClick = (e) => {
    if (!user?.isPremium && statistics?.companyCount >= 1) {
      e.preventDefault();
      toast.error("Free users can only add 1 company. Upgrade to Pro for unlimited companies!");
    }
  };

  const handleAddInternshipClick = (e) => {
    if (!user?.isPremium && statistics?.internshipCount >= 1) {
      e.preventDefault();
      toast.error("Free users can only post 1 internship. Upgrade to Pro for unlimited internship posts!");
    }
  };

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
        backgroundColor: 'rgba(37, 99, 235, 0.85)', // Royal Blue
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
      },
      {
        label: 'Internship Applications',
        data: internshipApplications.map(item => item.count),
        backgroundColor: 'rgba(15, 23, 42, 0.85)', // Black/Slate 900
        borderColor: 'rgb(15, 23, 42)',
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
        labels: {
          font: {
            family: 'Plus Jakarta Sans',
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Application Trends - Jobs vs Internships',
        font: {
          family: 'Plus Jakarta Sans',
          size: 16,
          weight: '700'
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Plus Jakarta Sans'
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Plus Jakarta Sans'
          }
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
        backgroundColor: 'rgba(29, 78, 216, 0.85)', // Strong Blue
        borderColor: 'rgb(29, 78, 216)',
        borderWidth: 1,
      },
      {
        label: 'Internship Selections',
        data: internshipSelections.map(item => item.count),
        backgroundColor: 'rgba(148, 163, 184, 0.85)', // Slate Gray
        borderColor: 'rgb(148, 163, 184)',
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
        labels: {
          font: {
            family: 'Plus Jakarta Sans',
            weight: '500'
          }
        }
      },
      title: {
        display: true,
        text: 'Selection Success - Jobs vs Internships',
        font: {
          family: 'Plus Jakarta Sans',
          size: 16,
          weight: '700'
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Plus Jakarta Sans'
          }
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Plus Jakarta Sans'
          }
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <style>{shineStyle}</style>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-900 text-white border-b border-slate-800 min-h-screen">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-blue-900 rounded-full opacity-10 blur-3xl"></div>
          <div className="absolute top-1/4 -left-1/4 w-80 h-80 bg-slate-800 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-950 rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 min-h-screen lg:h-screen py-24 lg:py-0 flex flex-col justify-center mt-8 lg:mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="text-left space-y-6 mt-12 lg:mt-0">
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Welcome,{' '}
                <span className="text-blue-500 inline-flex items-center">
                  {user.firstName}
                  {isAuthenticated && (
                    <BadgeCheck className="text-blue-500 ml-2 w-8 h-8 flex-shrink-0" />
                  )}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-xl">
                Streamline your hiring process with our powerful recruiter tools.
                Effortlessly manage job postings, track applicants, and maintain
                company profiles—all in one place.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center justify-center bg-slate-800/40 border border-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center">
                  <CheckCircle className="w-4 h-4 mr-2.5 text-blue-500 flex-shrink-0" />
                  <span>Easy Management</span>
                </div>
                <div className="flex items-center justify-center bg-slate-800/40 border border-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center">
                  <CheckCircle className="w-4 h-4 mr-2.5 text-blue-500 flex-shrink-0" />
                  <span>Real-time Tracking</span>
                </div>
                <div className="flex items-center justify-center bg-slate-800/40 border border-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center">
                  <CheckCircle className="w-4 h-4 mr-2.5 text-blue-500 flex-shrink-0" />
                  <span>All-in-One Platform</span>
                </div>
                <div className="flex items-center justify-center bg-slate-800/40 border border-slate-700/60 text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium text-center shine-effect">
                  {user?.isPremium ? (
                    <>
                      <Crown className="w-4 h-4 mr-2.5 text-blue-500 flex-shrink-0" />
                      <span>Pro Recruiter</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2.5 text-blue-500 flex-shrink-0" />
                      <span>Upgrade Pro</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative hidden lg:block ml-[70px]">
              <div className="rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300 hover:scale-105 border border-slate-800">
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

      {/* Quick Actions Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-12 text-center">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link 
              to="/jobs/add" 
              onClick={handleAddJobClick}
              className={`flex flex-col items-center p-8 bg-slate-50 border border-slate-100 rounded-2xl transition duration-200 ${
                !user?.isPremium && statistics?.jobCount >= 1 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:bg-blue-50/30 hover:border-blue-200 hover-grow'
              }`}
            >
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-bold text-slate-900">Add New Job</span>
            </Link>
            <Link 
              to="/companies/add" 
              onClick={handleAddCompanyClick}
              className={`flex flex-col items-center p-8 bg-slate-50 border border-slate-100 rounded-2xl transition duration-200 ${
                !user?.isPremium && statistics?.companyCount >= 1 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:bg-blue-50/30 hover:border-blue-200 hover-grow'
              }`}
            >
              <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mb-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="font-bold text-slate-900">Add New Company</span>
            </Link>
            <Link 
              to="/internships/add" 
              onClick={handleAddInternshipClick}
              className={`flex flex-col items-center p-8 bg-slate-50 border border-slate-100 rounded-2xl transition duration-200 ${
                !user?.isPremium && statistics?.internshipCount >= 1 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:bg-blue-50/30 hover:border-blue-200 hover-grow'
              }`}
            >
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-5 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V6a4 4 0 018 0v1m4 0a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2h16zM10 12h4" />
                </svg>
              </div>
              <span className="font-bold text-slate-900">Add New Internship</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-12 text-center">Powerful Recruiting Tools</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition duration-200 hover-grow max-w-md mx-auto flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden border-b border-slate-100">
                  <img src="https://cdn.pixabay.com/photo/2019/01/19/19/22/recruitment-3942378_640.jpg" 
                    alt="Job Management" 
                    className="w-full h-full object-cover"/>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Job Management</h3>
                  <p className="text-slate-500 mb-4 text-sm leading-relaxed">Create, edit, and manage all your job postings in one centralized dashboard.</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link to="/jobs" className="text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center transition-colors">Manage Jobs &rarr;</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition duration-200 hover-grow max-w-md mx-auto flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden border-b border-slate-100">
                  <img src="https://www.foundit.in/career-advice/wp-content/uploads/2022/03/interview-question-and-answer-for-hr-recruiter-1068x559.jpg" 
                    alt="Internship Management" 
                    className="w-full h-full object-cover"/>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Internship Management</h3>
                  <p className="text-slate-500 mb-4 text-sm leading-relaxed">Create, edit, and manage all your internship postings in one centralized dashboard.</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link to="/internships" className="text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center transition-colors">Manage Internships &rarr;</Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition duration-200 hover-grow max-w-md mx-auto flex flex-col justify-between">
              <div>
                <div className="h-48 overflow-hidden border-b border-slate-100">
                  <img src="https://www.shutterstock.com/image-vector/real-estate-developer-entrepreneur-concept-600nw-487692952.jpg" alt="Company Profiles" className="w-full h-full object-cover"/>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Company Profiles</h3>
                  <p className="text-slate-500 mb-4 text-sm leading-relaxed">Maintain detailed company information and branding for all your clients.</p>
                </div>
              </div>
              <div className="p-6 pt-0">
                <Link to="/companies" className="text-blue-600 font-semibold hover:text-blue-700 text-sm inline-flex items-center transition-colors">Manage Companies &rarr;</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Charts Section */}
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-12 border-b border-slate-100">
        <h2 className="text-3xl font-bold text-center text-slate-900 mb-12 tracking-tight">Analytics Dashboard</h2>
        
        {/* Application Trends Chart */}
        <div className="mb-12">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="h-80">
              <Bar data={applicationChartData} options={applicationChartOptions} />
            </div>
          </div>
        </div>

        {/* Selection Success Chart */}
        <div>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="h-80">
              <Bar data={selectionChartData} options={selectionChartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto py-16 px-6 sm:px-8 lg:px-12">
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 transition duration-200 hover:-translate-y-1 hover:shadow-md border-t-4 border-blue-600 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Companies</h3>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Briefcase className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900">{statistics.companyCount}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Active organizations</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 transition duration-200 hover:-translate-y-1 hover:shadow-md border-t-4 border-slate-900 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Jobs</h3>
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-900">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900">{statistics.jobCount}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Open positions</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 transition duration-200 hover:-translate-y-1 hover:shadow-md border-t-4 border-blue-600 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Internships</h3>
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-4xl font-bold text-slate-900">{statistics.internshipCount}</p>
                <p className="text-xs text-slate-400 mt-2 font-medium">Training opportunities</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;