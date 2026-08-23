'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Package, 
  BellRing, 
  TrendingDown, 
  Wallet,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  totalProducts: number;
  activeAlerts: number;
  totalPriceDrops: number;
  totalSavings: number;
  productsBackInStock: number;
}

interface RecentChange {
  _id: string;
  name: string;
  image?: string;
  currentPrice: number;
  priceChange: number;
  availability: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/analytics/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(res.data.data.metrics);
      setRecentChanges(res.data.data.recentChanges);
    } catch (error) {
      console.error('Error fetching analytics', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    { name: 'Products Tracked', value: metrics?.totalProducts || 0, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Alerts', value: metrics?.activeAlerts || 0, icon: BellRing, color: 'text-purple-600', bg: 'bg-purple-50' },
    { name: 'Price Drops Detected', value: metrics?.totalPriceDrops || 0, icon: TrendingDown, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Estimated Savings', value: `₹${metrics?.totalSavings.toLocaleString() || 0}`, icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Your price intelligence summary</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Changes Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Price Changes</h2>
          <Link href="/dashboard/products" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {recentChanges.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No tracked products yet. Add a product to see activity.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentChanges.map((product) => (
              <div key={product._id} className="p-4 px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate max-w-xs sm:max-w-sm">{product.name}</h3>
                    <p className={`text-xs mt-1 ${product.availability === 'IN_STOCK' ? 'text-green-600' : 'text-red-500'}`}>
                      {product.availability === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{product.currentPrice?.toLocaleString()}</p>
                  {product.priceChange !== 0 && product.priceChange !== null && (
                    <p className={`text-xs font-medium mt-1 flex items-center justify-end ${product.priceChange < 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {product.priceChange < 0 ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {product.priceChange > 0 ? '+' : ''}₹{Math.abs(product.priceChange).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
