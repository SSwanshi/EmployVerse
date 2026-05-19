import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminApi } from '../../services/adminApi';
import { fetchPendingVerificationsCount } from '../../store/slices/pendingVerificationsSlice';
import Card from '../../components/ui/Card';
import Header from '../../components/common/Header';
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
  const dispatch = useDispatch();
  const { count: pendingCount } = useSelector((state) => state.pendingVerifications);
  const [stats, setStats] = useState({
    applicants: 0,
    recruiters: 0,
    companies: 0,
    jobs: 0,
    internships: 0,
    premiumUsers: 0,
  });
  const [registrationData, setRegistrationData] = useState({
    applicants: [],
    recruiters: []
  });
  const [postingData, setPostingData] = useState({
    jobs: [],
    internships: []
  });
  const [selectionData, setSelectionData] = useState({
    jobSelections: [],
    internshipSelections: []
  });
  const [applicationData, setApplicationData] = useState({
    jobApplications: [],
    internshipApplications: []
  });
  const [revenueData, setRevenueData] = useState({
    premiumApplicants: 0,
    premiumRecruiters: 0
  });
  const [loading, setLoading] = useState(true);

  // Helper function to group registrations by date
  const groupRegistrationsByDate = () => {
    const last6Months = [];
    const currentDate = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      // Count registrations for this month (mock data processing)
      // In real implementation, filter by createdAt date
      const count = Math.floor(Math.random() * 20) + 5; // Mock data
      
      last6Months.push({
        period: monthName,
        count: count
      });
    }
    
    return last6Months;
  };

  useEffect(() => {
    fetchStats();
    dispatch(fetchPendingVerificationsCount());
  }, [dispatch]);

  const fetchStats = async () => {
    try {
      const [applicants, recruiters, companies, jobs, internships, premiumUsers] = await Promise.all([
        adminApi.getApplicants().catch(() => []),
        adminApi.getRecruiters().catch(() => []),
        adminApi.getCompanies().catch(() => []),
        adminApi.getJobs().catch(() => []),
        adminApi.getInternships().catch(() => []),
        adminApi.getPremiumUsers().catch(() => []),
      ]);

      setStats({
        applicants: applicants.length || 0,
        recruiters: recruiters.length || 0,
        companies: companies.length || 0,
        jobs: jobs.flatMap(c => c.jobs || []).length || 0,
        internships: internships.flatMap(c => c.internships || []).length || 0,
        premiumUsers: premiumUsers.length || 0,
      });

      // Process time-based registration data
      setRegistrationData({
        applicants: applicants || [],
        recruiters: recruiters || []
      });

      // Process time-based posting data
      setPostingData({
        jobs: jobs.flatMap(c => c.jobs || []) || [],
        internships: internships.flatMap(c => c.internships || []) || []
      });

      // Process time-based selection data (mock data for now)
      setSelectionData({
        jobSelections: Array(30).fill().map(() => ({ // Mock 30 selections
          selectedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        })),
        internshipSelections: Array(15).fill().map(() => ({ // Mock 15 selections
          selectedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        }))
      });

      // Process time-based application data (mock data for now)
      setApplicationData({
        jobApplications: Array(150).fill().map(() => ({ // Mock 150 job applications
          submittedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        })),
        internshipApplications: Array(80).fill().map(() => ({ // Mock 80 internship applications
          submittedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000)
        }))
      });

      // Set revenue data based on premium users
      setRevenueData({
        premiumApplicants: Math.floor(stats.premiumUsers * 0.6) || 12, // 60% applicants
        premiumRecruiters: Math.floor(stats.premiumUsers * 0.4) || 8   // 40% recruiters
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header title="Dashboard" />
        <div className="text-center py-12">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    { name: 'Applicants', value: stats.applicants, href: '/applicants', color: 'bg-blue-500' },
    { name: 'Recruiters', value: stats.recruiters, href: '/recruiters', color: 'bg-green-500' },
    { name: 'Companies', value: stats.companies, href: '/companies', color: 'bg-purple-500' },
    { name: 'Jobs', value: stats.jobs, href: '/jobs', color: 'bg-yellow-500' },
    { name: 'Internships', value: stats.internships, href: '/internships', color: 'bg-pink-500' },
    { name: 'Premium Users', value: stats.premiumUsers, href: '/premium-users', color: 'bg-indigo-500' },
  ];

  // Generate time-based registration data
  const applicantRegistrations = groupRegistrationsByDate(registrationData.applicants, 'applicant');
  const recruiterRegistrations = groupRegistrationsByDate(registrationData.recruiters, 'recruiter');
  
  // Generate time-based posting data
  const jobPostings = groupRegistrationsByDate(postingData.jobs, 'job');
  const internshipPostings = groupRegistrationsByDate(postingData.internships, 'internship');

  // Generate time-based selection data
  const jobSelections = groupRegistrationsByDate(selectionData.jobSelections, 'jobSelection');
  const internshipSelections = groupRegistrationsByDate(selectionData.internshipSelections, 'internshipSelection');

  // Generate time-based application data
  const jobApplications = groupRegistrationsByDate(applicationData.jobApplications, 'jobApplication');
  const internshipApplications = groupRegistrationsByDate(applicationData.internshipApplications, 'internshipApplication');

  // Calculate revenue data
  const applicantRevenue = revenueData.premiumApplicants * 299;
  const recruiterRevenue = revenueData.premiumRecruiters * 999;
  
  // Chart.js configuration for time-based registration chart
  const chartData = {
    labels: applicantRegistrations.map(item => item.period),
    datasets: [
      {
        label: 'Applicant Registrations',
        data: applicantRegistrations.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Recruiter Registrations',
        data: recruiterRegistrations.map(item => item.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Registration Trends - Applicants vs Recruiters (Last 6 Months)',
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
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Registrations'
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Chart.js configuration for jobs vs internships chart
  const postingChartData = {
    labels: jobPostings.map(item => item.period),
    datasets: [
      {
        label: 'Jobs Posted',
        data: jobPostings.map(item => item.count),
        backgroundColor: 'rgba(234, 179, 8, 0.8)',
        borderColor: 'rgb(234, 179, 8)',
        borderWidth: 1,
      },
      {
        label: 'Internships Posted',
        data: internshipPostings.map(item => item.count),
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 1,
      },
    ],
  };

  const postingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Posting Trends - Jobs vs Internships (Last 6 Months)',
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
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Postings'
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Chart.js configuration for applicant selections chart
  const selectionChartData = {
    labels: jobSelections.map(item => item.period),
    datasets: [
      {
        label: 'Job Selections',
        data: jobSelections.map(item => item.count),
        backgroundColor: 'rgba(139, 69, 19, 0.8)',
        borderColor: 'rgb(139, 69, 19)',
        borderWidth: 1,
      },
      {
        label: 'Internship Selections',
        data: internshipSelections.map(item => item.count),
        backgroundColor: 'rgba(124, 58, 237, 0.8)',
        borderColor: 'rgb(124, 58, 237)',
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
        text: 'Selection Trends - Job vs Internship Selections (Last 6 Months)',
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
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Selections'
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Chart.js configuration for application submissions chart
  const applicationChartData = {
    labels: jobApplications.map(item => item.period),
    datasets: [
      {
        label: 'Job Applications',
        data: jobApplications.map(item => item.count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Internship Applications',
        data: internshipApplications.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
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
        text: 'Application Submission Trends (Last 6 Months)',
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
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Applications'
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  // Chart.js configuration for revenue chart
  const revenueChartData = {
    labels: ['Premium Revenue'],
    datasets: [
      {
        label: `Applicant Revenue (₹${applicantRevenue.toLocaleString()})`,
        data: [applicantRevenue],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
      {
        label: `Recruiter Revenue (₹${recruiterRevenue.toLocaleString()})`,
        data: [recruiterRevenue],
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Revenue from Premium Users (Total: ₹${(applicantRevenue + recruiterRevenue).toLocaleString()})`,
        font: {
          size: 16
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return context.dataset.label.split(' (')[0] + ': ₹' + value.toLocaleString();
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        title: {
          display: true,
          text: 'Revenue Sources'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Revenue Amount (₹)'
        }
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  return (
    <div>
      <Header title="Dashboard" />
      
      {/* View Awaiting Verification Button */}
      <div className="mt-6 mb-6">
        <Link to="/companies/awaiting-verification">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-lg p-3 mr-4">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">View Awaiting Verification</p>
                  <p className="text-sm text-gray-500">Companies pending verification</p>
                </div>
              </div>
              {pendingCount > 0 && (
                <div className="relative">
                  <div className="bg-red-500 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center justify-center min-w-[24px] h-6">
                    {pendingCount}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {statCards.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Registration Statistics Chart */}
      <div className="mb-8 mt-8">
        <Card className="p-6">
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </Card>
      </div>

      {/* Jobs vs Internships Chart */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="h-80">
            <Bar data={postingChartData} options={postingChartOptions} />
          </div>
        </Card>
      </div>

      {/* Applicant Selections Chart */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="h-80">
            <Bar data={selectionChartData} options={selectionChartOptions} />
          </div>
        </Card>
      </div>

      {/* Application Submissions Chart */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="h-80">
            <Bar data={applicationChartData} options={applicationChartOptions} />
          </div>
        </Card>
      </div>

      {/* Revenue Chart */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="h-80">
            <Bar data={revenueChartData} options={revenueChartOptions} />
          </div>
        </Card>
      </div>

      
    </div>

    
  );
};

export default Dashboard;
