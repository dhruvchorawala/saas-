'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  BellRing,
  LogOut,
  Menu,
  X,
  TrendingDown,
  Search,
  Settings,
  HelpCircle,
  CreditCard,
  User as UserIcon
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const mainNav = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tracked Products', href: '/dashboard/products', icon: Package },
    { name: 'Price Alerts', href: '/dashboard/alerts', icon: BellRing },
  ];

  const secondaryNav = [
    { name: 'Profile Settings', href: '/dashboard/profile', icon: UserIcon },
    { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
    { name: 'Support', href: '/dashboard/help', icon: HelpCircle },
  ];

  return (
    <div className="h-screen bg-[#F8FAFC] flex font-sans selection:bg-indigo-500/30 pt-24">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Light Theme */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/60 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center h-20 px-6 border-b border-slate-100">
          <div className="bg-gradient-to-br from-indigo-500 to-violet-500 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-3">
            <TrendingDown className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight block">UPAI</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Price Intelligence</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          <nav className="p-4 space-y-1 mt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Analytics</div>
            {mainNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 relative
                    ${isActive
                      ? 'text-indigo-600 bg-indigo-50/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                  )}
                  <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <nav className="p-4 space-y-1 mt-auto border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Preferences</div>
            {secondaryNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                      ? 'text-indigo-600 bg-indigo-50/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <item.icon className={`mr-3 h-5 w-5 transition-colors duration-200 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center px-3 py-2 mb-3 bg-white rounded-xl shadow-sm border border-slate-200/60">
            <div className="w-9 h-9 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm shadow-md mr-3">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center px-4 py-2.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 hover:text-rose-700 transition-colors"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full relative">
        {/* Top Header */}
        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center flex-1">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-900 focus:outline-none mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="hidden sm:flex items-center max-w-md w-full glass rounded-full px-4 py-2.5 border border-slate-200/50 focus-within:bg-white focus-within:border-indigo-300 focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all duration-300 shadow-sm">
              <Search className="h-5 w-5 text-indigo-500 mr-2" />
              <input
                type="text"
                placeholder="Search across your intelligence dashboard..."
                className="bg-transparent border-none outline-none text-sm w-full text-slate-900 placeholder-slate-500 font-semibold"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
              <BellRing className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <Link href="/dashboard/products" className="hidden sm:flex items-center px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-slate-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
              + Track New Product
            </Link>
          </div>
        </header>

        {/* Main View Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
          {/* Subtle background glow */}
          <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-indigo-50/80 via-white/50 to-transparent pointer-events-none -z-10"></div>

          <div className="p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
