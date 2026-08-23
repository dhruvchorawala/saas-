'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { Activity, Clock, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

interface Job {
  id: string;
  name: string;
  productId: string;
  url: string;
  source: string;
  status: string;
  attempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  failedReason?: string;
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active,waiting,failed,completed');

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5000/api/v1/admin/jobs?type=${filter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.data.data);
    } catch (error) {
      console.error('Error fetching jobs', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'WAITING': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'ACTIVE': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-rose-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'WAITING': return 'bg-yellow-100 text-yellow-800';
      case 'ACTIVE': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
      case 'FAILED': return 'bg-rose-100 text-rose-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Job Monitoring (BullMQ)</h1>
          <p className="text-sm text-slate-500 mt-1">Real-time view of background scraper workers</p>
        </div>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
        >
          <option value="active,waiting,failed,completed">All Jobs</option>
          <option value="active,waiting">Pending/Active Only</option>
          <option value="failed">Failed Only</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Job ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Timeline</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Error Logs</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">Loading jobs from Redis...</td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-500">No jobs found in current filter.</td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      #{job.id}
                      <div className="text-xs text-slate-500 font-normal mt-1 truncate max-w-[200px]">{job.url}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex items-center text-xs font-semibold rounded-full ${getStatusStyle(job.status)}`}>
                        {getStatusIcon(job.status)}
                        <span className="ml-1.5">{job.status}</span>
                      </span>
                      {job.attempts > 1 && (
                        <div className="text-xs text-slate-500 mt-1">Attempts: {job.attempts}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {job.source || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      <div>Created: {format(new Date(job.createdAt), 'HH:mm:ss')}</div>
                      {job.startedAt && <div>Started: {format(new Date(job.startedAt), 'HH:mm:ss')}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 max-w-xs">
                      {job.failedReason ? (
                        <div className="flex items-start text-rose-600 bg-rose-50 p-2 rounded text-xs break-words">
                          <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{job.failedReason}</span>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
