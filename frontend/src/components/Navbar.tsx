'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  TrendingDown, User, LogOut, Package, Bell, Heart, LayoutDashboard, BarChart3, ShieldAlert, Menu, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const UNREAD_POLL_MS = 60 * 1000;

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!user) {
      setUnread(0);
      return;
    }
    const load = () => api.get('/notifications/unread-count')
      .then(res => setUnread(res.data.data.unread))
      .catch(() => {});
    load();
    const timer = setInterval(load, UNREAD_POLL_MS);
    return () => clearInterval(timer);
  }, [user, pathname]);

  const links = [
    { href: '/products', label: 'Browse', icon: Package, show: true },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: !!user },
    { href: '/watchlist', label: 'Watchlist', icon: Heart, show: !!user },
    { href: '/alerts', label: 'Alerts', icon: Bell, show: !!user, badge: unread },
    { href: '/analytics', label: 'Analytics', icon: BarChart3, show: true },
    { href: '/admin', label: 'Admin', icon: ShieldAlert, show: user?.role === 'ADMIN' },
  ].filter(link => link.show);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center ${
      isActive(href) ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center mt-4 px-4 pointer-events-none">
      <nav className="glass w-full max-w-6xl rounded-3xl px-5 py-3 pointer-events-auto shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="bg-gradient-to-br from-indigo-500 to-violet-500 w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 mr-2">
              <TrendingDown className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">UPAI</span>
          </Link>

          <div className="hidden lg:flex space-x-1 items-center">
            {links.map(link => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                <link.icon className="w-4 h-4 mr-1.5" /> {link.label}
                {!!link.badge && (
                  <span className="ml-1.5 min-w-5 h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-bold flex items-center justify-center">
                    {link.badge > 99 ? '99+' : link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="h-6 w-px bg-slate-200 mx-2" />
            {user ? (
              <>
                <Link href="/profile" title="Profile" className="p-2 rounded-full text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                  <User className="w-5 h-5" />
                </Link>
                <button onClick={logout} title="Log out" className="p-2 rounded-full text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-full text-sm font-semibold">Login</Link>
                <Link href="/register" className="bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 rounded-full text-slate-600 hover:bg-slate-100 relative"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {!open && unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />}
          </button>
        </div>

        {open && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1">
            {links.map(link => (
              <Link key={link.href} href={link.href} className={linkClass(link.href)}>
                <link.icon className="w-4 h-4 mr-2" /> {link.label}
                {!!link.badge && <span className="ml-auto text-xs font-bold text-rose-600">{link.badge} new</span>}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/profile" className={linkClass('/profile')}><User className="w-4 h-4 mr-2" /> Profile</Link>
                <button onClick={logout} className="px-3.5 py-2 rounded-full text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1 text-center py-2 rounded-full border border-slate-200 text-sm font-semibold text-slate-700">Login</Link>
                <Link href="/register" className="flex-1 text-center py-2 rounded-full bg-slate-900 text-sm font-semibold text-white">Sign up</Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}
