import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { DashboardStatsSkeleton } from '../../components/ui/SkeletonLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingKyc: 0,
    totalDoctors: 0,
    totalSpecializations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Fetch KYC requests
        const kycRes = await api.get('/admin/kyc-requests');
        const pendingKyc = kycRes?.data?.data?.length || 0;

        // Fetch doctors
        const doctorsRes = await api.get('/admin/doctors');
        const totalDoctors = doctorsRes?.data?.data?.length || 0;

        setStats({
          pendingKyc,
          totalDoctors,
          totalSpecializations: 0 // You can add this API call if needed
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'KYC Requests',
      description: 'Review and approve doctor verification requests',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      link: '/admin/kyc-requests',
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      badge: stats.pendingKyc > 0 ? stats.pendingKyc : null,
      urgent: stats.pendingKyc > 0
    },
    {
      title: 'Manage Doctors',
      description: 'View and manage registered doctors',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-3-3h-1m-2-3a3 3 0 11-6 0m3 3a3 3 0 00-3 3v2h5.586a1 1 0 00.707-.293l2.414-2.414A1 1 0 0020 16.586V14a3 3 0 00-3-3z" />
        </svg>
      ),
      link: '/admin/doctors',
      color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      badge: stats.totalDoctors > 0 ? stats.totalDoctors : null
    },
    {
      title: 'Specializations',
      description: 'Manage medical specializations',
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      link: '/admin/specializations',
      color: 'bg-gradient-to-r from-green-500 to-teal-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-text-secondary-dark">Manage your healthcare platform efficiently</p>
        </div>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-text-primary-dark mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-text-secondary-dark">Manage your healthcare platform efficiently</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-200 dark:border-dark-border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending KYC</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.pendingKyc}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-200 dark:border-dark-border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? '...' : stats.totalDoctors}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-bg-card-dark rounded-xl shadow-sm dark:shadow-card-dark border border-gray-200 dark:border-dark-border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Platform Status</p>
              <p className="text-2xl font-semibold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className={`relative block p-6 rounded-xl text-white transition-all duration-200 hover:scale-105 hover:shadow-lg ${action.color} ${action.urgent ? 'ring-2 ring-orange-300 ring-opacity-50 animate-pulse' : ''}`}
            >
              {action.badge && (
                <div className="absolute -top-2 -right-2 bg-white dark:bg-dark-surface text-gray-900 dark:text-text-primary-dark rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold shadow-lg">
                  {action.badge}
                </div>
              )}
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0 mr-3">
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold">{action.title}</h3>
              </div>
              <p className="text-white/90 text-sm">{action.description}</p>
              <div className="mt-4 flex items-center text-sm">
                <span>Go to {action.title}</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Platform Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Database Connection</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Last Updated</span>
            <span className="text-gray-500 text-sm">
              {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
