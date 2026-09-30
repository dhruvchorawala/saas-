'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Users, Activity } from 'lucide-react';
import RequireAuth from '../../components/RequireAuth';

const TABS = [
  { name: 'Overview', href: '/admin', icon: ShieldAlert },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Refresh jobs', href: '/admin/jobs', icon: Activity },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <RequireAuth admin>
      <div className="min-h-screen bg-slate-50 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 mb-8">
            {TABS.map(tab => (
              <Link
                key={tab.href}
                href={tab.href}
                className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                  pathname === tab.href ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" /> {tab.name}
              </Link>
            ))}
          </div>
          {children}
        </div>
      </div>
    </RequireAuth>
  );
}
