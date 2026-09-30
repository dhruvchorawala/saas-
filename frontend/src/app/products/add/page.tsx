'use client';
import { Suspense, useEffect, useRef, useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Link as LinkIcon, Search, Loader2, Sparkles } from 'lucide-react';
import api, { apiError } from '../../../services/api';
import RequireAuth from '../../../components/RequireAuth';

type Mode = 'query' | 'url';

function FindProduct() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>(params.get('url') ? 'url' : 'query');
  const [query, setQuery] = useState(params.get('query') || '');
  const [url, setUrl] = useState(params.get('url') || '');
  const [loading, setLoading] = useState(false);
  const autoSubmitted = useRef(false);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    const payload = mode === 'url' ? { url: url.trim() } : { query: query.trim() };
    if (!payload.url && !payload.query) return;

    setLoading(true);
    try {
      const res = await api.post('/products/discover', payload);
      if (!res.data.created) toast.success('That product is already in the catalog');
      router.push(`/products/${res.data.data._id}`);
    } catch (err) {
      toast.error(apiError(err, 'Could not find that product'));
      setLoading(false);
    }
  };

  // A link pasted into the search box elsewhere lands here: start straight away
  useEffect(() => {
    if (!autoSubmitted.current && params.get('url')) {
      autoSubmitted.current = true;
      submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabClass = (m: Mode) =>
    `flex-1 flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-bold transition-all ${
      mode === m ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-700'
    }`;

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Find the best price</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">We’ll search every store for this exact product.</p>
          </div>
          <Link href="/products" className="inline-flex items-center px-4 py-2 bg-white/70 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse
          </Link>
        </div>

        <div className="glass rounded-3xl overflow-hidden border border-white/60 shadow-sm">
          <div className="flex p-2 bg-slate-50/50 border-b border-slate-100">
            <button type="button" onClick={() => setMode('query')} className={tabClass('query')}>
              <Search className="w-4 h-4 mr-2" /> Product name
            </button>
            <button type="button" onClick={() => setMode('url')} className={tabClass('url')}>
              <LinkIcon className="w-4 h-4 mr-2" /> Store link
            </button>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            {mode === 'query' ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product name</label>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  required
                  maxLength={120}
                  placeholder="e.g. Samsung Galaxy S25 256GB"
                  className="block w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-900 outline-none"
                />
                <p className="mt-3 text-xs text-slate-500">
                  Include the brand, model and storage size for the most accurate match.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Product link</label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  required
                  placeholder="https://www.amazon.in/dp/..."
                  className="block w-full px-4 py-4 border border-slate-200 rounded-2xl bg-white/60 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-900 outline-none"
                />
                <p className="mt-3 text-xs text-slate-500">
                  Works with Amazon.in, Flipkart, Reliance Digital and Vijay Sales product pages.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
              {loading ? 'Reading the product…' : 'Compare prices'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AddProductPage() {
  return (
    <RequireAuth>
      <Suspense fallback={null}>
        <FindProduct />
      </Suspense>
    </RequireAuth>
  );
}
