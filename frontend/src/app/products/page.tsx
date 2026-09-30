'use client';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Package, Loader2, Sparkles, SlidersHorizontal } from 'lucide-react';
import api, { apiError } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ProductCard from '../../components/ProductCard';
import SearchBox from '../../components/SearchBox';
import type { Category, Product } from '../../lib/types';
import { CATEGORY_LABELS } from '../../lib/format';

interface Facets {
  categories: { name: Category; count: number }[];
  brands: { name: string; count: number }[];
}

const SORTS = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'savings', label: 'Biggest savings' },
  { value: 'newest', label: 'Recently added' },
];
const PAGE_SIZE = 12;
const POLL_MS = 10000;

function Browse() {
  const router = useRouter();
  const params = useSearchParams();
  const { user } = useAuth();

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const brand = params.get('brand') || '';
  const sort = params.get('sort') || 'relevance';
  const inStock = params.get('inStock') === 'true';
  const page = Number(params.get('page')) || 1;

  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [discovering, setDiscovering] = useState(false);

  const setParam = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in updates)) next.delete('page');
    router.push(`/products?${next.toString()}`);
  };

  const fetchProducts = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort });
      if (search) query.set('search', search);
      if (category) query.set('category', category);
      if (brand) query.set('brand', brand);
      if (inStock) query.set('inStock', 'true');
      const res = await api.get(`/products?${query}`);
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      if (!quiet) toast.error(apiError(err, 'Could not load products'));
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, category, brand, inStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get(`/products/facets${category ? `?category=${category}` : ''}`)
      .then(res => setFacets(res.data.data))
      .catch(() => {});
  }, [category]);

  // While the first prices are still being collected, keep the grid up to date
  const anyFetching = products.some(p => !p.lastCheckedAt);
  useEffect(() => {
    if (!anyFetching) return;
    const timer = setInterval(() => fetchProducts(true), POLL_MS);
    return () => clearInterval(timer);
  }, [anyFetching, fetchProducts]);

  const discover = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/products/add?query=${encodeURIComponent(search)}`)}`);
      return;
    }
    setDiscovering(true);
    try {
      const res = await api.post('/products/discover', { query: search });
      router.push(`/products/${res.data.data._id}`);
    } catch (err) {
      toast.error(apiError(err, 'Could not search the stores'));
      setDiscovering(false);
    }
  };

  const totalProducts = facets ? facets.categories.reduce((sum, c) => sum + c.count, 0) : 0;
  const tabs = [{ name: '', label: 'All', count: totalProducts }, ...(facets?.categories || []).map(c => ({ name: c.name, label: CATEGORY_LABELS[c.name], count: c.count }))];

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {search ? <>Results for “{search}”</> : category ? CATEGORY_LABELS[category as Category] : 'Browse products'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Best prices across Amazon.in, Flipkart, Reliance Digital and Vijay Sales.
          </p>
        </div>

        <div className="mb-6">
          <SearchBox key={search} initial={search} />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.name || 'all'}
              onClick={() => setParam({ category: tab.name || null, brand: null })}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                category === tab.name ? 'bg-slate-900 text-white shadow' : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-white'
              }`}
            >
              {tab.label} <span className="opacity-60 font-semibold">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-8">
          <div className="flex flex-wrap gap-2 flex-1">
            {(facets?.brands || []).map(b => (
              <button
                key={b.name}
                onClick={() => setParam({ brand: brand === b.name ? null : b.name })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  brand === b.name ? 'bg-indigo-600 text-white' : 'bg-white/70 text-slate-600 border border-slate-200 hover:border-indigo-300'
                }`}
              >
                {b.name} <span className="opacity-60">{b.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => setParam({ inStock: e.target.checked ? 'true' : null })}
                className="w-4 h-4 accent-indigo-600"
              />
              In stock only
            </label>
            <div className="flex items-center bg-white/80 border border-slate-200 rounded-xl px-3">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 mr-2" />
              <select
                value={sort}
                onChange={e => setParam({ sort: e.target.value })}
                className="bg-transparent py-2 text-sm font-semibold text-slate-700 outline-none cursor-pointer"
              >
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading products…</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/60 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
            {search ? (
              <>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                  “{search}” isn’t in our catalog yet. We can search all four stores for it right now.
                </p>
                <button
                  onClick={discover}
                  disabled={discovering}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-full font-bold hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {discovering ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Compare “{search}” across stores
                </button>
              </>
            ) : (
              <p className="text-slate-500">Try another category or clear the filters.</p>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 font-medium mb-4">{pagination.total} products</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(product => <ProductCard key={product._id} product={product} />)}
            </div>
            {search && (
              <p className="text-center text-sm text-slate-500 mt-8">
                Not the product you meant?{' '}
                <button onClick={discover} disabled={discovering} className="font-bold text-indigo-600 hover:underline">
                  Search all stores for “{search}”
                </button>
              </p>
            )}
          </>
        )}

        {!loading && pagination.pages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setParam({ page: String(page - 1) })}
              className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-500">Page {page} of {pagination.pages}</span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setParam({ page: String(page + 1) })}
              className="px-5 py-2.5 border border-slate-200 rounded-full text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {!user && (
          <p className="text-center text-sm text-slate-500 mt-10">
            <Link href="/register" className="font-bold text-indigo-600 hover:underline">Create a free account</Link> to save products and get price-drop alerts.
          </p>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <Browse />
    </Suspense>
  );
}
