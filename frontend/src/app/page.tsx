'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone, Laptop, Headphones, Watch, Search, Store, BellRing, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchBox from '../components/SearchBox';
import ProductCard from '../components/ProductCard';
import type { Product } from '../lib/types';
import { timeAgo } from '../lib/format';

interface Stats {
  products: number;
  priced: number;
  offers: number;
  brands: number;
  stores: string[];
  lastUpdated: string | null;
  topDeals: Product[];
}

const CATEGORIES = [
  { key: 'smartphones', label: 'Smartphones', icon: Smartphone, color: 'from-indigo-500 to-violet-500' },
  { key: 'laptops', label: 'Laptops', icon: Laptop, color: 'from-sky-500 to-cyan-400' },
  { key: 'audio', label: 'Audio', icon: Headphones, color: 'from-rose-500 to-orange-400' },
  { key: 'wearables', label: 'Wearables & Tablets', icon: Watch, color: 'from-emerald-500 to-teal-400' },
];

const STEPS = [
  { icon: Search, title: 'Pick a product', text: 'Browse top brands or search any product by name or store link.' },
  { icon: Store, title: 'We check every store', text: 'Live prices from Amazon.in, Flipkart, Reliance Digital and Vijay Sales, matched to the exact variant.' },
  { icon: BellRing, title: 'Buy at the best price', text: 'See the cheapest in-stock store, the price history, and get alerts when prices drop.' },
];

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get('/analytics/stats').then(res => setStats(res.data.data)).catch(() => {});
  }, []);

  const statTiles = stats
    ? [
        { value: stats.products, label: 'Products tracked' },
        { value: stats.stores.length, label: 'Stores compared' },
        { value: stats.brands, label: 'Brands' },
        { value: stats.offers, label: 'Live store prices' },
      ]
    : [];

  return (
    <div className="min-h-screen mesh-bg overflow-hidden pt-24 pb-16">
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10 text-center animate-fade-in-up">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse-slow" />
          {stats?.lastUpdated ? `Prices updated ${timeAgo(stats.lastUpdated)}` : 'Live prices from Indian stores'}
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6 text-balance">
          Find the best price across <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
            every store, instantly
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-600 mb-10 text-balance">
          UPAI compares top brands on Amazon.in, Flipkart, Reliance Digital and Vijay Sales,
          so you always know where to buy for less.
        </p>

        <div className="max-w-3xl mx-auto">
          <SearchBox size="lg" />
        </div>
      </section>

      {stats && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <div className="glass rounded-3xl p-8 border border-white/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statTiles.map(tile => (
              <div key={tile.label}>
                <div className="text-3xl md:text-4xl font-extrabold text-slate-900">{tile.value.toLocaleString('en-IN')}</div>
                <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{tile.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Shop by category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.key}
              href={`/products?category=${cat.key}`}
              className="group bg-white/70 backdrop-blur rounded-2xl p-5 border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md mr-4 shrink-0`}>
                <cat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-slate-900">{cat.label}</span>
              <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Biggest savings right now</h2>
            <p className="text-slate-500 text-sm mt-1">Where picking the right store saves you the most</p>
          </div>
          <Link href="/products?sort=savings" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center">
            See all <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {!stats ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
        ) : stats.topDeals.length === 0 ? (
          <div className="bg-white/70 rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
            Prices are being collected from the stores for the first time. Check back in a few minutes.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.topDeals.map(product => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, i) => (
            <div key={step.title} className="bg-white/70 backdrop-blur rounded-2xl p-6 border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{i + 1}. {step.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>
        {!user && (
          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center px-8 py-4 font-bold rounded-full text-white bg-slate-900 hover:bg-indigo-600 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Create a free account for alerts <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
