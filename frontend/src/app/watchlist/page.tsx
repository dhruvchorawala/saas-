'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';
import { Bell, Loader2, BookmarkPlus } from 'lucide-react';
import Link from 'next/link';

export default function WatchlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const res = await api.get('/watchlist');
      // Watchlist model has a `products` array
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWatchlist = async (productId: string) => {
    try {
      await api.delete(`/watchlist/${productId}`);
      toast.success('Removed from watchlist');
      // Update local state
      setProducts(products.filter((p: any) => p._id !== productId));
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  return (
    <div className="min-h-screen mesh-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Watchlist</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Products you are actively monitoring for alerts.</p>
            </div>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm">
            {products.length} {products.length === 1 ? 'Item' : 'Items'} Tracked
          </div>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading your watchlist...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/60 shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookmarkPlus className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Your watchlist is empty</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">Add products to your watchlist to receive instant notifications when their prices drop.</p>
              <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-rose-50 text-rose-700 rounded-full font-bold hover:bg-rose-100 transition-colors">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <div key={product._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                  <ProductCard 
                    product={product} 
                    isWatchlist={true} 
                    onRemoveFromWatchlist={handleRemoveFromWatchlist} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
