import { useEffect, useState, useRef } from 'react';
import Chart from 'chart.js/auto';
import { applicantApi } from '../services/applicantApi';

// Custom Chart Canvas component to bypass react-chartjs-2 hooks issue with React 19
const CustomChart = ({ type, data, options }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(canvasRef.current, {
      type,
      data,
      options,
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data, options]);

  return <canvas ref={canvasRef} />;
};

const StatCard = ({ label, value, sub, color }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-1">
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className={`text-3xl font-bold ${color || 'text-gray-800'}`}>{value}</span>
    {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await applicantApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load dashboard stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-gray-400 text-lg animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // ── Prepare chart data ────────────────────────────────────────────────────
  const getChartData = () => {
    try {
      // Doughnut data
      const doughnutData = {
        labels: ['Selected', 'Rejected', 'Pending'],
        datasets: [
          {
            data: [stats.selected, stats.rejected, stats.pending],
            backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
            borderColor: ['#16a34a', '#dc2626', '#d97706'],
            borderWidth: 2,
            hoverOffset: 8,
          },
        ],
      };

      // Bar data
      const barData = {
        labels: ['Jobs Applied', 'Internships Applied'],
        datasets: [
          {
            label: 'Applications',
            data: [stats.totalJobs, stats.totalInternships],
            backgroundColor: ['#6366f1', '#06b6d4'],
            borderColor: ['#4f46e5', '#0891b2'],
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      };

      // Line data
      const monthLabels = Object.keys(stats.monthly || {}).map((key) => {
        const [year, month] = key.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleString('default', { month: 'short', year: '2-digit' });
      });

      const lineData = {
        labels: monthLabels,
        datasets: [
          {
            label: 'Applications',
            data: Object.values(stats.monthly || {}),
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.3,
          },
        ],
      };

      return { doughnutData, barData, lineData };
    } catch (err) {
      console.error('Error preparing chart data:', err);
      return null;
    }
  };

  const chartData = getChartData();

  if (!chartData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-lg">Error loading dashboard charts</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">My Dashboard</h1>
      <p className="text-sm text-gray-400 mb-8">A summary of your application activity</p>

      {/* ── Stat Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Applications"
          value={stats.totalApplications}
          sub="Jobs + Internships"
          color="text-indigo-600"
        />
        <StatCard
          label="Selected"
          value={stats.selected}
          sub="Offers received"
          color="text-green-600"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          sub="Not shortlisted"
          color="text-red-500"
        />
        <StatCard
          label="Response Rate"
          value={`${stats.responseRate}%`}
          sub="(Selected + Rejected) / Total"
          color="text-amber-500"
        />
      </div>

      {/* ── Charts Row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Doughnut */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Application Outcomes</h2>
          {stats.totalApplications === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No applications yet.</p>
          ) : (
            <div className="flex justify-center">
              <div style={{ maxWidth: 300, width: '100%' }}>
                <CustomChart 
                  key="doughnut"
                  type="doughnut"
                  data={chartData.doughnutData} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { position: 'bottom', labels: { padding: 16, font: { size: 13 } } },
                      tooltip: {
                        callbacks: {
                          label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                            return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                          },
                        },
                      },
                    },
                    cutout: '65%',
                  }} 
                />
              </div>
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-700 mb-4">Jobs vs Internships</h2>
          {stats.totalApplications === 0 ? (
            <p className="text-gray-400 text-sm text-center py-12">No applications yet.</p>
          ) : (
            <CustomChart 
              key="bar"
              type="bar"
              data={chartData.barData} 
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} applications` } },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, precision: 0 },
                    grid: { color: '#f3f4f6' },
                  },
                  x: { grid: { display: false } },
                },
              }} 
            />
          )}
        </div>
      </div>

      {/* ── Charts Row 2 ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Application Activity — Last 12 Months
        </h2>
        <CustomChart 
          key="line"
          type="line"
          data={chartData.lineData} 
          options={{
            responsive: true,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.y} application(s)` } },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { stepSize: 1, precision: 0 },
                grid: { color: '#f3f4f6' },
              },
              x: { grid: { display: false } },
            },
          }} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
