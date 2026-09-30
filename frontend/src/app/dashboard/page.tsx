'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, BellRing, TrendingDown, Wallet, ArrowRight, Loader2, Package, Search, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api, { apiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RequireAuth from '../../components/RequireAuth';
import ProductImage from '../../components/ProductImage';
import type { Notification, Product } from '../../lib/types';
import { formatINR, timeAgo } from '../../lib/format';

interface DashboardData {
  metrics: {
    watchedProducts: number;
    activeAlerts: number;
    alertsTriggered: number;
    unreadNotifications: number;
    priceDrops: number;
    totalSavings: number;
  };
  savingsChart: { name: string; bestPrice: number; highestPrice: number; savings: number }[];
  watched: Product[];
  recentNotifications: Notification[];
}

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(res => setData(res.data.data))
      .catch(err => toast.error(apiError(err, 'Could not load your dashboard')));
  }, []);

  if (!data) {
    return <div className="min-h-screen mesh-bg flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  }

  const { metrics } = data;
  const tiles = [
    { name: 'Watched products', value: metrics.watchedProducts, icon: Heart, color: 'from-rose-500 to-orange-400', href: '/watchlist' },
    { name: 'Active alerts', value: metrics.activeAlerts, icon: BellRing, color: 'from-violet-500 to-fuchsia-500', href: '/alerts' },
    { name: 'Price drops since last check', value: metrics.priceDrops, icon: TrendingDown, color: 'from-emerald-500 to-teal-400', href: '/watchlist' },
    { name: 'Saved by comparing stores', value: formatINR(metrics.totalSavings), icon: Wallet, color: 'from-amber-400 to-orange-500', href: '/watchlist' },
  ];

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Hi {user?.name.split(' ')[0]}! <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Ready to save?</span>
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              {metrics.watchedProducts === 0
                ? 'Watch a few products and we’ll track the best price for you.'
                : <>You’re watching {metrics.watchedProducts} product{metrics.watchedProducts === 1 ? '' : 's'}{metrics.unreadNotifications > 0 && <> and have <strong className="text-indigo-600">{metrics.unreadNotifications} new alert{metrics.unreadNotifications === 1 ? '' : 's'}</strong></>}.</>}
            </p>
          </div>
          <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors shrink-0">
            <Search className="w-5 h-5 mr-2" /> Find products
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiles.map(tile => (
            <Link key={tile.name} href={tile.href} className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tile.color} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                <tile.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{tile.value}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">{tile.name}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Cheapest vs. priciest store</h2>
            <p className="text-sm text-slate-500 font-medium mb-6">For the products you watch, based on today’s prices</p>
            <div className="h-[320px]">
              {data.savingsChart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-sm bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-8 h-8 mb-2" />
                  Watch products sold by more than one store to see how much comparing saves you.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.savingsChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} interval={0} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `₹${Math.round(v / 1000)}k`} width={52} />
                    <Tooltip formatter={value => formatINR(Number(value))} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)' }} />
                    <Legend />
                    <Bar dataKey="bestPrice" name="Best price" maxBarSize={56} fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="highestPrice" name="Highest price" maxBarSize={56} fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Recent alerts</h2>
              <Link href="/alerts" className="text-sm text-indigo-600 font-bold flex items-center">All <ArrowRight className="h-4 w-4 ml-1" /></Link>
            </div>
            {data.recentNotifications.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Bell className="h-8 w-8 text-slate-300 mb-3" />
                <p className="text-sm text-slate-500">No alerts yet. Set one on any product page.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.recentNotifications.map(n => (
                  <li key={n._id} className="p-3 rounded-2xl border border-slate-100">
                    <p className="text-sm font-semibold text-slate-800 line-clamp-2">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Your watched products</h2>
            <Link href="/watchlist" className="text-sm text-indigo-600 font-bold flex items-center">Manage <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </div>
          {data.watched.length === 0 ? (
            <p className="text-sm text-slate-500">You’re not watching anything yet. <Link href="/products" className="font-bold text-indigo-600">Browse products</Link></p>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.watched.map(p => (
                <Link key={p._id} href={`/products/${p._id}`} className="flex items-center gap-4 py-3 hover:bg-slate-50/60 rounded-xl px-2 -mx-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 p-1 shrink-0"><ProductImage src={p.image} alt={p.name} className="w-full h-full" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">Checked {timeAgo(p.lastCheckedAt)} · {p.storeCount} store{p.storeCount === 1 ? '' : 's'}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-slate-900">{formatINR(p.bestPrice)}</p>
                    <p className="text-xs text-slate-500">{p.bestStore || '—'}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
