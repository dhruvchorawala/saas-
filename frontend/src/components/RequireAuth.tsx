'use client';
import { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Renders children only for logged-in users (optionally admins); otherwise redirects to login. */
export default function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (admin && user.role !== 'ADMIN') router.replace('/dashboard');
  }, [user, loading, admin, router, pathname]);

  if (loading || !user || (admin && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
}
