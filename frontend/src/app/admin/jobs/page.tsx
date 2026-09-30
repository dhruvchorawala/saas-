'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Clock, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import api, { apiError } from '../../../services/api';
import { timeAgo } from '../../../lib/format';

interface Job {
  id: number;
  productId: string;
  productName: string;
  priority: 'high' | 'normal';
  reason: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
  result: { found: number; errors: number; bestPrice: number | null } | null;
}

const STATUS = {
  WAITING: { icon: Clock, style: 'bg-amber-100 text-amber-800' },
  ACTIVE: { icon: RefreshCw, style: 'bg-blue-100 text-blue-800' },
  COMPLETED: { icon: CheckCircle, style: 'bg-emerald-100 text-emerald-800' },
  FAILED: { icon: XCircle, style: 'bg-rose-100 text-rose-800' },
};

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<'ALL' | Job['status']>('ALL');

  const load = useCallback(() => {
    api.get('/admin/jobs')
      .then(res => setJobs(res.data.data))
      .catch(err => toast.error(apiError(err, 'Could not load jobs')));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
  }, [load]);

  const shown = filter === 'ALL' ? jobs : jobs.filter(j => j.status === filter);
  const duration = (job: Job) =>
    job.startedAt && job.finishedAt ? `${((new Date(job.finishedAt).getTime() - new Date(job.startedAt).getTime()) / 1000).toFixed(1)}s` : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Price refresh jobs</h1>
          <p className="text-sm text-slate-500 mt-1">Each job searches every store for one product. Updates every 3 seconds.</p>
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm">
          <option value="ALL">All jobs</option>
          <option value="ACTIVE">Running</option>
          <option value="WAITING">Waiting</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Trigger</th>
                <th className="px-5 py-3">Timing</th>
                <th className="px-5 py-3">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-500">No jobs since the server started.</td></tr>
              ) : shown.map(job => {
                const status = STATUS[job.status];
                return (
                  <tr key={`${job.id}-${job.status}`} className="hover:bg-slate-50">
                    <td className="px-5 py-3 text-sm font-semibold text-slate-900">
                      <Link href={`/products/${job.productId}`} className="hover:text-indigo-600">{job.productName}</Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${status.style}`}>
                        <status.icon className={`w-3.5 h-3.5 mr-1 ${job.status === 'ACTIVE' ? 'animate-spin' : ''}`} /> {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {job.reason}{job.priority === 'high' && <span className="ml-1 font-bold text-indigo-600">(priority)</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                      queued {timeAgo(job.createdAt)}{duration(job) && ` · took ${duration(job)}`}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {job.error ? <span className="text-rose-600">{job.error}</span>
                        : job.result ? <span className="text-slate-600">found on {job.result.found} store(s){job.result.errors ? `, ${job.result.errors} store error(s)` : ''}</span>
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
