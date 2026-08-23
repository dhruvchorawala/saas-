'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/ProductCard';
import toast from 'react-hot-toast';

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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Watchlist</h1>
        <p className="mt-1 text-sm text-gray-500">Products you are actively monitoring for alerts.</p>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading watchlist...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 bg-white shadow-sm rounded-lg border border-gray-200">
          <p className="text-gray-500">Your watchlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              isWatchlist={true} 
              onRemoveFromWatchlist={handleRemoveFromWatchlist} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
