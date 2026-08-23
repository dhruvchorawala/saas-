'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Package, BellRing, Activity, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminMetrics {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  activeAlerts: number;
  scrapingJobs: number;
  successfulJobs: number;
  failedJobs: number;
  activeJobs: number;
  waitingJobs: number;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(res.data.data);
    } catch (error) {
      console.error('Error fetching admin metrics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading system metrics...</div>;

  const statCards = [
    { name: 'Total Users', value: metrics?.totalUsers || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Active Users (USER role)', value: metrics?.activeUsers || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Products Tracked', value: metrics?.totalProducts || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Active Alerts', value: metrics?.activeAlerts || 0, icon: BellRing, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const jobCards = [
    { name: 'Total Jobs in Queue', value: metrics?.scrapingJobs || 0, icon: Activity, color: 'text-slate-600', bg: 'bg-slate-100' },
    { name: 'Waiting / Active', value: `${metrics?.waitingJobs || 0} / ${metrics?.activeJobs || 0}`, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Successful Jobs', value: metrics?.successfulJobs || 0, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Failed Jobs', value: metrics?.failedJobs || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Global metrics across the entire SaaS</p>
      </div>

      {/* Global SaaS Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Background Worker Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {jobCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex items-center">
              <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
