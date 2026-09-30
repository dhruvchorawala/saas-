'use client';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Users, Package, BellRing, CheckCircle, XCircle, Clock, RefreshCw, Store, Search, Bell, Loader2 } from 'lucide-react';
import api, { apiError } from '../../services/api';

interface AdminMetrics {
  totalUsers: number;
  totalProducts: number;
  pricedProducts: number;
  failedProducts: number;
  userProducts: number;
  offersFound: number;
  activeAlerts: number;
  notifications: number;
  queue: { waiting: number; active: number; completed: number; failed: number; concurrency: number };
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get('/admin/analytics')
      .then(res => setMetrics(res.data.data))
      .catch(err => toast.error(apiError(err, 'Could not load metrics')));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  const trigger = async (path: string) => {
    setBusy(true);
    try {
      const res = await api.post(path);
      toast.success(`Queued ${res.data.data.queued} product(s) for a refresh`);
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (!metrics) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>;

  const cards = [
    { name: 'Users', value: metrics.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Catalog products', value: metrics.totalProducts, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Products with a price', value: metrics.pricedProducts, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Added by user search', value: metrics.userProducts, icon: Search, color: 'text-violet-600', bg: 'bg-violet-100' },
    { name: 'Live store offers', value: metrics.offersFound, icon: Store, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Active alerts', value: metrics.activeAlerts, icon: BellRing, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'Notifications sent', value: metrics.notifications, icon: Bell, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Failed refreshes', value: metrics.failedProducts, icon: XCircle, color: 'text-slate-600', bg: 'bg-slate-200' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System overview</h1>
          <p className="text-sm text-slate-500 mt-1">Live numbers, refreshed every 5 seconds</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => trigger('/admin/refresh-stale')} disabled={busy} className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-60">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh stale prices
          </button>
          <button onClick={() => trigger('/admin/refresh-all')} disabled={busy} className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-indigo-600 disabled:opacity-60">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh everything
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.name} className="bg-white rounded-2xl p-5 border border-slate-200 flex items-center">
            <div className={`p-3 rounded-xl ${card.bg} mr-4`}><card.icon className={`h-5 w-5 ${card.color}`} /></div>
            <div>
              <p className="text-xs font-semibold text-slate-500">{card.name}</p>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Refresh queue (in-process, {metrics.queue.concurrency} at a time)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Waiting', value: metrics.queue.waiting, icon: Clock, color: 'text-amber-500' },
            { label: 'Running', value: metrics.queue.active, icon: RefreshCw, color: 'text-blue-500' },
            { label: 'Completed', value: metrics.queue.completed, icon: CheckCircle, color: 'text-emerald-500' },
            { label: 'Failed', value: metrics.queue.failed, icon: XCircle, color: 'text-rose-500' },
          ].map(item => (
            <div key={item.label} className="p-4 rounded-xl bg-slate-50 flex items-center">
              <item.icon className={`w-5 h-5 mr-3 ${item.color}`} />
              <div>
                <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-4">Counts since the server last started.</p>
      </div>
    </div>
  );
}
