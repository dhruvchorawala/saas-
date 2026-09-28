'use client';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import { Package, Search, Plus, Loader2 } from 'lucide-react';

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${page}&limit=9${search ? `&search=${search}` : ''}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-bg pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Your Tracked Products</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Manage and monitor your entire catalog.</p>
            </div>
          </div>
          <Link
            href="/products/add"
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-full font-semibold hover:bg-indigo-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Track New Product
          </Link>
        </div>

        {/* Search Bar */}
        <div className="glass rounded-2xl p-2 mb-8 flex items-center border border-white/60 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all duration-300 shadow-sm animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="pl-4 pr-2">
            <Search className="w-6 h-6 text-indigo-500" />
          </div>
          <input
            type="text"
            placeholder="Search products by name or URL..."
            className="flex-1 bg-transparent border-none outline-none py-3 px-2 text-slate-900 placeholder-slate-500 font-bold text-base"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Content Area */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-slate-500 font-medium">Loading your products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/60 shadow-sm">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">You aren't tracking any products that match your search. Add one to start monitoring prices.</p>
              <Link href="/products/add" className="inline-flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-700 rounded-full font-bold hover:bg-indigo-100 transition-colors">
                Start Tracking
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any) => (
                <div key={product._id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 overflow-hidden group hover:-translate-y-1">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && products.length > 0 && (
          <div className="mt-12 flex justify-center space-x-3">
            <button 
              disabled={!pagination.prev} 
              onClick={() => setPage(page - 1)}
              className="px-6 py-2.5 border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Previous
            </button>
            <button 
              disabled={!pagination.next} 
              onClick={() => setPage(page + 1)}
              className="px-6 py-2.5 border border-slate-200 rounded-full shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white transition-all"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
