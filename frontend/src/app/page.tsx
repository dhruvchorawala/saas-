import Link from 'next/link';
import { ShieldCheck, Zap, BarChart3, BellRing, ArrowRight, TrendingDown } from 'lucide-react';

export default function Home() {
  const features = [
    {
      name: 'Real-time Tracking',
      description: 'Monitor prices across multiple e-commerce platforms automatically.',
      icon: Zap,
    },
    {
      name: 'Smart Alerts',
      description: 'Get instantly notified when products hit your target price.',
      icon: BellRing,
    },
    {
      name: 'Price History',
      description: 'Analyze trends and make informed buying decisions.',
      icon: BarChart3,
    },
    {
      name: 'Verified Sources',
      description: 'We only track data from verified and trusted retailers.',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen mesh-bg overflow-hidden pt-24 pb-12">
      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center animate-fade-in-up">
        
        {/* Floating elements for visual flair */}
        <div className="absolute top-10 left-1/4 animate-float opacity-30">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl blur-xl"></div>
        </div>
        <div className="absolute top-32 right-1/4 animate-float opacity-20" style={{ animationDelay: '1s' }}>
          <div className="w-24 h-24 bg-gradient-to-br from-rose-400 to-orange-400 rounded-full blur-xl"></div>
        </div>

        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50/80 border border-indigo-100 text-indigo-700 font-semibold text-sm mb-8 shadow-sm backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse-slow"></span>
          UPAI 2.0 is now live
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 text-balance mx-auto">
          Universal Price & <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
            Availability Intelligence
          </span>
        </h1>
        
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 mb-10 text-balance">
          Track product prices and availability across multiple e-commerce sources in real-time. 
          Never miss a deal with instant alerts and comprehensive analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-white bg-slate-900 hover:bg-indigo-600 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(79,70,229,0.3)] hover:-translate-y-1"
          >
            Start Tracking Free
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-base font-bold rounded-full text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Stats preview / Social Proof */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass rounded-3xl p-8 md:p-12 border border-white/60">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-extrabold text-slate-900">10k+</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Products Tracked</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900">₹2M+</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">User Savings</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900">50+</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Supported Stores</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-slate-900">24/7</div>
              <div className="text-sm font-semibold text-slate-500 mt-1 uppercase tracking-wider">Price Monitoring</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900">Everything you need to shop smarter</h2>
          <p className="mt-4 text-lg text-slate-600">Powerful tools designed to save you time and money.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.name} 
              className="bg-white/60 backdrop-blur-md rounded-2xl p-6 border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.name}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
