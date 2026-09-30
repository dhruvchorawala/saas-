'use client';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowRight, Lock, Mail, Activity } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();
  const next = useSearchParams().get('next');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login({ email, password });
    setSubmitting(false);
    if (ok) router.push(next && next.startsWith('/') && !next.startsWith('//') ? next : '/dashboard');
  };

  return (
    <div className="min-h-screen mesh-bg flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl mix-blend-multiply animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">UPAI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
            <p className="text-slate-500 mt-2 text-sm">Sign in to your intelligence dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder-slate-400 text-slate-900 outline-none"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm placeholder-slate-400 text-slate-900 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-slate-900 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 mt-6 group disabled:opacity-60"
            >
              Sign In
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline underline-offset-4">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
