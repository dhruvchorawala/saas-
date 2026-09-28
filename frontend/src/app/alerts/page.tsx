'use client';
import { useState, useEffect } from 'react';
import {
  BellRing,
  Plus,
  Settings,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  PackageX,
  Clock,
  MoreVertical,
  Search,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

// Mock Data for Alerts
const mockAlerts = [
  {
    id: '1',
    productName: 'Apple iPhone 16 Pro (256GB)',
    condition: 'PRICE_DROP',
    targetValue: '₹1,00,000',
    currentValue: '₹1,19,900',
    status: 'ACTIVE',
    lastTriggered: null,
    icon: TrendingDown,
    color: 'emerald'
  },
  {
    id: '2',
    productName: 'Sony WH-1000XM5 Noise Canceling Headphones',
    condition: 'BACK_IN_STOCK',
    targetValue: 'In Stock',
    currentValue: 'Out of Stock',
    status: 'ACTIVE',
    lastTriggered: null,
    icon: PackageCheck,
    color: 'indigo'
  },
  {
    id: '3',
    productName: 'Dyson V15 Detect Absolute',
    condition: 'PRICE_DROP',
    targetValue: '₹55,000',
    currentValue: '₹54,900',
    status: 'TRIGGERED',
    lastTriggered: '2 hours ago',
    icon: CheckCircle2,
    color: 'amber'
  }
];

export default function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-fade-in pb-12 pt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BellRing className="w-64 h-64 text-indigo-600" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <div className="bg-indigo-100 p-2.5 rounded-xl mr-4">
              <BellRing className="h-7 w-7 text-indigo-600" />
            </div>
            Alert Engine
          </h1>
          <p className="text-slate-500 mt-2 text-lg max-w-2xl">
            Configure custom triggers for price drops, stock availability, and seller changes.
          </p>
        </div>
        <div className="relative z-10 shrink-0 flex gap-3">
          <button className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-all shadow-md hover:-translate-y-0.5">
            <Plus className="w-5 h-5 mr-2" />
            Create Alert
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-slate-900 font-medium placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            placeholder="Search alerts by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select className="bg-slate-50 border-none text-slate-700 font-semibold rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer appearance-none pr-10 relative">
            <option>All Statuses</option>
            <option>Active</option>
            <option>Triggered</option>
            <option>Paused</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 gap-4">
        {mockAlerts.map((alert) => (
          <div key={alert.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
            
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-${alert.color}-50`}>
                <alert.icon className={`w-7 h-7 text-${alert.color}-600`} />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                    alert.status === 'ACTIVE' ? 'bg-indigo-100 text-indigo-700' :
                    alert.status === 'TRIGGERED' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {alert.status}
                  </span>
                  {alert.lastTriggered && (
                    <span className="text-xs font-semibold text-slate-400 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" /> Triggered {alert.lastTriggered}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-900 truncate" title={alert.productName}>
                  {alert.productName}
                </h3>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 shrink-0 bg-slate-50 rounded-xl p-4 sm:p-0 sm:bg-transparent">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target</span>
                <span className="text-sm font-black text-slate-900">{alert.targetValue}</span>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
              
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Current</span>
                <span className="text-sm font-black text-slate-900">{alert.currentValue}</span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

              <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
