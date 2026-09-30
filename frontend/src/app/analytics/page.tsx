'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BarChart3, Loader2, Trophy, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api, { apiError } from '../../services/api';
import ProductImage from '../../components/ProductImage';
import type { Category } from '../../lib/types';
import { CATEGORY_LABELS, STORE_COLORS, formatINR, timeAgo } from '../../lib/format';

interface MarketData {
  stores: { name: string; wins: number; winRate: number; listed: number }[];
  categories: { name: Category; products: number; priced: number; avgBestPrice: number | null }[];
  biggestGaps: { _id: string; name: string; image?: string; bestPrice: number; bestStore: string; highestPrice: number; gap: number; gapPercent: number }[];
  recentMovers: { _id: string; name: string; image?: string; bestPrice: number; bestStore: string; priceChange: number; priceChangePercentage: number; lastCheckedAt: string }[];
  totalCompared: number;
}

const STORE_KEY_BY_NAME: Record<string, string> = {
  'Amazon.in': 'amazon', Flipkart: 'flipkart', 'Reliance Digital': 'reliance', 'Vijay Sales': 'vijaysales',
};
const CATEGORY_COLORS = ['#6366f1', '#0ea5e9', '#f43f5e', '#10b981'];
const tooltipStyle = { borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)' };

export default function AnalyticsPage() {
  const [data, setData] = useState<MarketData | null>(null);

  useEffect(() => {
    api.get('/analytics/market')
      .then(res => setData(res.data.data))
      .catch(err => toast.error(apiError(err, 'Could not load analytics')));
  }, []);

  if (!data) {
    return <div className="min-h-screen mesh-bg flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  }

  const topStore = [...data.stores].sort((a, b) => b.wins - a.wins)[0];
  const categoryData = data.categories.map(c => ({ ...c, label: CATEGORY_LABELS[c.name] }));

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <BarChart3 className="h-8 w-8 mr-3 text-indigo-500" /> Market analytics
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Live comparison of {data.totalCompared} products sold by more than one store.
            {topStore && topStore.wins > 0 && <> <strong className="text-slate-800">{topStore.name}</strong> has the lowest price most often ({topStore.winRate}%).</>}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center"><Trophy className="w-5 h-5 mr-2 text-amber-500" /> Cheapest store wins</h2>
            <p className="text-sm text-slate-500 mb-4">How often each store has the best price</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stores} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v, _n, item) => [`${v} products (${item.payload.winRate}%)`, 'Cheapest']} />
                  <Bar dataKey="wins" radius={[8, 8, 0, 0]}>
                    {data.stores.map(s => <Cell key={s.name} fill={STORE_COLORS[STORE_KEY_BY_NAME[s.name]] || '#6366f1'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 flex items-center"><Scale className="w-5 h-5 mr-2 text-indigo-500" /> Catalog coverage</h2>
            <p className="text-sm text-slate-500 mb-4">Catalog products each store currently sells</p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.stores} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }} width={110} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} products`, 'Listed']} />
                  <Bar dataKey="listed" radius={[0, 8, 8, 0]}>
                    {data.stores.map(s => <Cell key={s.name} fill={STORE_COLORS[STORE_KEY_BY_NAME[s.name]] || '#6366f1'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Products by category</h2>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="products" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={4}>
                    {categoryData.map((c, i) => <Cell key={c.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {categoryData.map(c => (
                <li key={c.name} className="flex justify-between">
                  <span className="text-slate-600">{c.label}</span>
                  <span className="font-semibold text-slate-900">avg {formatINR(c.avgBestPrice)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">Biggest price gaps between stores</h2>
            <p className="text-sm text-slate-500 mb-4">Where choosing the right store matters most</p>
            {data.biggestGaps.length === 0 ? (
              <p className="text-sm text-slate-400">Not enough store prices collected yet.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {data.biggestGaps.map(p => (
                  <li key={p._id}>
                    <Link href={`/products/${p._id}`} className="flex items-center gap-4 py-3 hover:bg-slate-50/60 rounded-xl px-2 -mx-2">
                      <div className="w-11 h-11 rounded-lg bg-slate-50 p-1 shrink-0"><ProductImage src={p.image} alt={p.name} className="w-full h-full" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="text-xs text-slate-500">{formatINR(p.bestPrice)} on {p.bestStore} vs up to {formatINR(p.highestPrice)}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                        Save {formatINR(p.gap)} ({p.gapPercent}%)
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent price moves</h2>
          {data.recentMovers.length === 0 ? (
            <p className="text-sm text-slate-400">No price changes detected yet. Moves show up after prices are re-checked (every few hours).</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.recentMovers.map(p => (
                <Link key={p._id} href={`/products/${p._id}`} className="p-4 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2 min-h-[2.5rem]">{p.name}</p>
                  <p className="text-lg font-black text-slate-900 mt-2">{formatINR(p.bestPrice)}</p>
                  <p className={`text-xs font-bold flex items-center ${p.priceChange < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {p.priceChange < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-1" /> : <TrendingUp className="w-3.5 h-3.5 mr-1" />}
                    {formatINR(Math.abs(p.priceChange))} ({Math.abs(p.priceChangePercentage)}%) · {timeAgo(p.lastCheckedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
