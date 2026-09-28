'use client';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Activity, User, LogOut, Package, Bell, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 px-4 pointer-events-none">
      <nav className="glass w-full max-w-5xl rounded-full px-6 py-3 pointer-events-auto transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-2 transform transition-transform hover:scale-105">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <Link href="/" className="text-xl font-extrabold text-slate-900 tracking-tight hover:opacity-80 transition-opacity">
              UPAI
            </Link>
          </div>

          <div className="hidden md:flex space-x-1 items-center">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${isActive('/dashboard') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Activity className="w-4 h-4 mr-1.5" /> Dashboard
                </Link>
                <Link
                  href="/products"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${isActive('/products') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Package className="w-4 h-4 mr-1.5" /> Products
                </Link>
                <Link
                  href="/watchlist"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${isActive('/watchlist') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Bell className="w-4 h-4 mr-1.5" /> Watchlist
                </Link>
                <Link
                  href="/analytics"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${isActive('/analytics') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Activity className="w-4 h-4 mr-1.5" /> Analytics
                </Link>
                <Link
                  href="/alerts"
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${isActive('/alerts') ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <Bell className="w-4 h-4 mr-1.5" /> Alerts
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2"></div>
                <Link
                  href="/profile"
                  className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-full text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors ml-1"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-slate-900 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:shadow-lg hover:-translate-y-0.5 ml-2"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
