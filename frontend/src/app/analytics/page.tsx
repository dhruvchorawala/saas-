'use client';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Package,
  AlertTriangle,
  Zap,
  BarChart3,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

// Mock Data for Advanced Analytics
const priceVolatilityData = [
  { name: 'Mon', volatility: 2 },
  { name: 'Tue', volatility: 5 },
  { name: 'Wed', volatility: 12 },
  { name: 'Thu', volatility: 8 },
  { name: 'Fri', volatility: 15 },
  { name: 'Sat', volatility: 4 },
  { name: 'Sun', volatility: 7 },
];

const categoryDistribution = [
  { name: 'Electronics', value: 45 },
  { name: 'Fashion', value: 25 },
  { name: 'Home Appliances', value: 20 },
  { name: 'Books', value: 10 },
];
const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#14b8a6'];

const retailerCompetitiveness = [
  { name: 'Amazon', wins: 85, losses: 15 },
  { name: 'Flipkart', wins: 65, losses: 35 },
  { name: 'Walmart', wins: 45, losses: 55 },
  { name: 'Best Buy', wins: 30, losses: 70 },
];

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);
  const [timeFilter, setTimeFilter] = useState('30D');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BarChart3 className="w-64 h-64 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <Activity className="h-8 w-8 mr-3 text-indigo-500" />
            Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 ml-2">Analytics</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            Deep dive into your tracked market data, price volatility, and retailer competitiveness.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex items-center space-x-2 bg-slate-50 p-1.5 rounded-full border border-slate-200">
          {['7D', '30D', '90D', 'ALL'].map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${timeFilter === filter ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <TrendingDown className="h-8 w-8 text-indigo-500 mb-4" />
            <h3 className="text-3xl font-black text-slate-900">14.2%</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Average Price Drop</p>
            <p className="text-xs text-emerald-500 font-bold mt-3 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> 2.1% vs last month</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-violet-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <Activity className="h-8 w-8 text-violet-500 mb-4" />
            <h3 className="text-3xl font-black text-slate-900">High</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Market Volatility Index</p>
            <p className="text-xs text-rose-500 font-bold mt-3 flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> More price swings detected</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-pink-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <Package className="h-8 w-8 text-pink-500 mb-4" />
            <h3 className="text-3xl font-black text-slate-900">89%</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">In-Stock Reliability</p>
            <p className="text-xs text-emerald-500 font-bold mt-3 flex items-center">Across 124 tracked products</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <Zap className="h-8 w-8 text-amber-500 mb-4" />
            <h3 className="text-3xl font-black text-slate-900">92<span className="text-lg text-slate-400">/100</span></h3>
            <p className="text-sm font-semibold text-slate-500 mt-1">Global Deal Score</p>
            <p className="text-xs text-amber-600 font-bold mt-3 flex items-center">Current market conditions favorable</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Volatility Chart */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Price Volatility Trend</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Frequency of price changes detected</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={priceVolatilityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVolatility" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="volatility" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolatility)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Retailer Competitiveness */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Retailer Competitiveness</h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Lowest price win rate by source</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={retailerCompetitiveness} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#0f172a', fontSize: 13, fontWeight: 700 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="wins" name="Lowest Price" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={24} />
                <Bar dataKey="losses" name="Higher Price" stackId="a" fill="#e2e8f0" radius={[0, 8, 8, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm lg:col-span-1 flex flex-col items-center">
          <h2 className="text-xl font-bold text-slate-900 w-full text-left mb-2">Tracked Categories</h2>
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full grid grid-cols-2 gap-4 mt-4">
            {categoryDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center text-sm font-semibold text-slate-700">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* AI Insight Box */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-8 rounded-3xl shadow-xl lg:col-span-2 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10 text-white max-w-xl">
            <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
              <SparklesIcon className="w-4 h-4 mr-2 text-amber-300" />
              AI Intelligence Insight
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">
              Electronics are experiencing abnormal price drops this week.
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
              Based on the 30-day moving average, 45% of your tracked electronics are currently priced near their historical lows. We recommend reviewing your Watchlist to capture these deals before stock runs out.
            </p>
            <Link href="/products" className="inline-flex items-center px-6 py-3 bg-white text-indigo-900 font-bold rounded-full hover:bg-indigo-50 transition-colors shadow-lg shadow-black/20">
              View Recommended Deals
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  );
}
