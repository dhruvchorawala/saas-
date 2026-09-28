'use client';
import { CreditCard, CheckCircle2, Zap, ArrowRight, Download, Receipt } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const invoices = [
    { id: 'INV-2026-001', date: 'Aug 01, 2026', amount: '₹0.00', status: 'Paid', plan: 'Free Tier' },
    { id: 'INV-2026-002', date: 'Jul 01, 2026', amount: '₹0.00', status: 'Paid', plan: 'Free Tier' },
    { id: 'INV-2026-003', date: 'Jun 01, 2026', amount: '₹0.00', status: 'Paid', plan: 'Free Tier' },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Plans</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage your subscription, payment methods, and invoices.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Current Plan Overview */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl mix-blend-multiply translate-x-1/3 -translate-y-1/3"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Current Plan</h2>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-slate-900">Free</span>
                    <span className="text-slate-500 font-medium">/ forever</span>
                  </div>
                </div>
                <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-sm border border-green-100 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Active
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                  <span className="font-medium">Up to 25 tracked products</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                  <span className="font-medium">Daily price checks</span>
                </div>
                <div className="flex items-center text-slate-700">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />
                  <span className="font-medium">Email notifications</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-slate-500">10 / 25 products used</span>
                  <Link href="/dashboard/products" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    View usage &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="glass rounded-3xl p-8 border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-slate-400" />
              Billing History
            </h2>
            <div className="overflow-hidden rounded-xl border border-slate-200/60">
              <table className="min-w-full divide-y divide-slate-200/60">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-slate-200/60">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-white/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{invoice.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer">
                          <Download className="w-4 h-4 mr-1.5" />
                          {invoice.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">{invoice.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upgrade Card */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl mix-blend-screen translate-x-1/2 -translate-y-1/4 group-hover:bg-indigo-400/40 transition-colors duration-500"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/20">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              
              <h3 className="text-2xl font-extrabold text-white mb-2">Upgrade to Pro</h3>
              <p className="text-indigo-200 text-sm font-medium mb-8 leading-relaxed">
                Unlock unlimited tracking, instant SMS alerts, and deep historical pricing data.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Unlimited tracked products</span>
                </div>
                <div className="flex items-start text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Instant SMS & Webhook alerts</span>
                </div>
                <div className="flex items-start text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Hourly price checks</span>
                </div>
                <div className="flex items-start text-white/90">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-sm font-medium">Priority support</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline space-x-1">
                  <span className="text-4xl font-extrabold text-white">₹499</span>
                  <span className="text-indigo-200 font-medium text-sm">/ month</span>
                </div>
              </div>

              <button className="w-full flex items-center justify-center px-6 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_25px_rgba(99,102,241,0.6)]">
                Upgrade Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
