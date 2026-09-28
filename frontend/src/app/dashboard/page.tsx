'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Package,
  BellRing,
  TrendingDown,
  Wallet,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface DashboardMetrics {
  totalProducts: number;
  activeAlerts: number;
  totalPriceDrops: number;
  totalSavings: number;
  productsBackInStock: number;
}

interface RecentChange {
  _id: string;
  name: string;
  image?: string;
  currentPrice: number;
  priceChange: number;
  availability: string;
}

// Mock data for the savings chart since it's not in the API yet
const mockSavingsData = [
  { name: 'Jan', savings: 1200 },
  { name: 'Feb', savings: 1900 },
  { name: 'Mar', savings: 1500 },
  { name: 'Apr', savings: 2800 },
  { name: 'May', savings: 2200 },
  { name: 'Jun', savings: 3400 },
  { name: 'Jul', savings: 4100 },
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // If no token (mock view), we just simulate loading and show 0s
      if (!token) {
        setTimeout(() => setLoading(false), 800);
        return;
      }
      const res = await axios.get('http://localhost:5000/api/v1/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(res.data.data.metrics);
      setRecentChanges(res.data.data.recentChanges);
    } catch (error) {
      console.error('Error fetching analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] animate-pulse">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin relative z-10" />
        </div>
        <p className="mt-4 text-slate-500 font-medium">Gathering your price intelligence...</p>
      </div>
    );
  }

  const statCards = [
    { name: 'Tracked Products', value: metrics?.totalProducts || 0, icon: Package, color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', trend: '+2 this week' },
    { name: 'Active Alerts', value: metrics?.activeAlerts || 0, icon: BellRing, color: 'from-violet-500 to-fuchsia-500', shadow: 'shadow-violet-500/20', trend: '3 triggered today' },
    { name: 'Price Drops', value: metrics?.totalPriceDrops || 0, icon: TrendingDown, color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20', trend: 'Looking good!' },
    { name: 'Potential Savings', value: `₹${(metrics?.totalSavings || 0).toLocaleString()}`, icon: Wallet, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20', trend: '+15% vs last month' },
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Sparkles className="w-64 h-64 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome back! <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500">Ready to save?</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            Here's what's happening with your monitored products today. We've found <strong className="text-emerald-600">{metrics?.totalPriceDrops || 0} price drops</strong> for you.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex flex-col sm:flex-row gap-3">
          <Link href="/products/add" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
            <Activity className="w-5 h-5 mr-2" />
            Track New Product
          </Link>
          <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-full font-semibold hover:bg-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto">
            View All Products
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={stat.name}
            className="group bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.color} rounded-full opacity-[0.03] group-hover:scale-150 transition-transform duration-700 ease-out`}></div>

            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-semibold text-slate-500 mt-1">{stat.name}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50">
              <p className="text-xs font-medium text-slate-400 flex items-center">
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Savings Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Savings Overview</h2>
              <p className="text-sm text-slate-500 font-medium">Cumulative savings over time</p>
            </div>
            <select className="bg-slate-50/50 border border-slate-200 text-slate-700 rounded-xl text-sm px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              <option>This Year</option>
              <option>Last 6 Months</option>
            </select>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockSavingsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13, fontWeight: 500 }} tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                  formatter={(value) => [`₹${value}`, 'Savings']}
                />
                <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Changes Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Activity</h2>
            <Link href="/products" className="text-sm text-indigo-600 hover:text-indigo-800 font-bold flex items-center group">
              View all <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {recentChanges.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-semibold mb-1">No activity yet</p>
              <p className="text-sm text-slate-500 mb-4">Add products to start tracking their prices.</p>
              <Link href="/products/add" className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors">
                Track New Product
              </Link>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {recentChanges.map((product) => (
                <div key={product._id} className="group p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-300 flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="h-12 w-12 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-full w-full object-contain" />
                      ) : (
                        <Package className="h-6 w-6 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate pr-4" title={product.name}>{product.name}</h3>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${product.availability === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {product.availability === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-black text-slate-900">₹{product.currentPrice?.toLocaleString()}</p>
                    {product.priceChange !== 0 && product.priceChange !== null && (
                      <p className={`text-xs font-bold mt-1 flex items-center justify-end ${product.priceChange < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {product.priceChange < 0 ? (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        )}
                        {product.priceChange > 0 ? '+' : ''}₹{Math.abs(product.priceChange).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
