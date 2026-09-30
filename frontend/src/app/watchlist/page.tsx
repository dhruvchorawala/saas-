'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Heart, Loader2 } from 'lucide-react';
import api, { apiError } from '../../services/api';
import RequireAuth from '../../components/RequireAuth';
import ProductCard from '../../components/ProductCard';
import type { Product } from '../../lib/types';

function Watchlist() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/watchlist')
      .then(res => setProducts(res.data.data))
      .catch(err => toast.error(apiError(err, 'Could not load your watchlist')))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (productId: string) => {
    try {
      await api.delete(`/watchlist/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      toast.success('Removed from watchlist');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-400 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your watchlist</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Products you’re keeping an eye on. Prices refresh automatically.</p>
            </div>
          </div>
          <div className="inline-flex items-center px-4 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-sm">
            {products.length} {products.length === 1 ? 'product' : 'products'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="bg-white/80 rounded-3xl p-12 text-center border border-white/60 shadow-sm">
            <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Nothing here yet</h3>
            <p className="text-slate-500 mb-6">Tap “Watch” on any product to follow its price.</p>
            <Link href="/products" className="inline-flex px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => <ProductCard key={product._id} product={product} onRemove={remove} />)}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <RequireAuth>
      <Watchlist />
    </RequireAuth>
  );
}
