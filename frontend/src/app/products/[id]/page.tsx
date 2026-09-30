'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft, ExternalLink, Heart, Loader2, RefreshCw, ShoppingCart, Store, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Trash2,
} from 'lucide-react';
import api, { apiError } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import ProductImage from '../../../components/ProductImage';
import PriceHistoryChart from '../../../components/PriceHistoryChart';
import AlertPanel from '../../../components/AlertPanel';
import type { HistoryPoint, Offer, ProductDetail } from '../../../lib/types';
import { CATEGORY_LABELS, STORE_COLORS, formatINR, savingsPercent, timeAgo } from '../../../lib/format';

const POLL_MS = 4000;

function OfferRow({ offer, isBest }: { offer: Offer; isBest: boolean }) {
  const dot = <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STORE_COLORS[offer.store] || '#6366f1' }} />;

  if (offer.status !== 'FOUND') {
    return (
      <tr className="text-slate-400">
        <td className="px-5 py-4"><div className="flex items-center gap-2 font-semibold text-slate-600">{dot}{offer.storeName}</div></td>
        <td colSpan={3} className="px-5 py-4 text-sm">
          {offer.status === 'NOT_FOUND' ? 'Not listed on this store' : (
            <span className="flex items-center text-amber-600"><AlertCircle className="w-4 h-4 mr-1.5" /> Couldn’t check this store last time</span>
          )}
        </td>
        <td className="px-5 py-4" />
      </tr>
    );
  }

  return (
    <tr className={isBest ? 'bg-emerald-50/60' : 'hover:bg-slate-50/60'}>
      <td className="px-5 py-4 align-top">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          {dot}{offer.storeName}
          {isBest && <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold uppercase">Best</span>}
        </div>
        <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-xs" title={offer.title}>{offer.title}</p>
      </td>
      <td className="px-5 py-4 align-top whitespace-nowrap">
        <div className={`font-black ${isBest ? 'text-emerald-700 text-lg' : 'text-slate-900'}`}>{formatINR(offer.price)}</div>
        {offer.mrp && offer.mrp > (offer.price || 0) && (
          <div className="text-xs text-slate-400"><span className="line-through">{formatINR(offer.mrp)}</span> · {savingsPercent(offer.price, offer.mrp)}% off</div>
        )}
      </td>
      <td className="px-5 py-4 align-top whitespace-nowrap">
        {offer.inStock ? (
          <span className="inline-flex items-center text-xs font-bold text-emerald-700"><CheckCircle2 className="w-4 h-4 mr-1" /> In stock</span>
        ) : (
          <span className="text-xs font-bold text-rose-500">Out of stock</span>
        )}
      </td>
      <td className="px-5 py-4 align-top text-xs text-slate-400 whitespace-nowrap">{timeAgo(offer.lastCheckedAt)}</td>
      <td className="px-5 py-4 align-top text-right">
        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${isBest ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
        >
          View deal <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
        </a>
      </td>
    </tr>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [productRes, historyRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/products/${id}/history`),
      ]);
      setProduct(productRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      toast.error(apiError(err, 'Product not found'));
      router.push('/products');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  // Reload when the login state changes so watchlist/alert info is correct
  useEffect(() => {
    load();
  }, [load, user]);

  const busy = !!product && (product.isQueued || product.refreshStatus === 'PENDING' || product.refreshStatus === 'REFRESHING');
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(load, POLL_MS);
    return () => clearInterval(timer);
  }, [busy, load]);

  const refresh = async () => {
    if (!user) {
      router.push(`/login?next=/products/${id}`);
      return;
    }
    setRefreshing(true);
    try {
      const res = await api.post(`/products/${id}/refresh`);
      toast.success(res.data.message || 'Checking prices');
      await load();
    } catch (err) {
      toast.error(apiError(err, 'Could not refresh'));
    } finally {
      setRefreshing(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user || !product) {
      router.push(`/login?next=/products/${id}`);
      return;
    }
    try {
      if (product.viewer?.inWatchlist) {
        await api.delete(`/watchlist/${id}`);
        toast.success('Removed from watchlist');
      } else {
        await api.post('/watchlist', { productId: id });
        toast.success('Added to watchlist');
      }
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const remove = async () => {
    if (!confirm('Delete this product and all of its price history?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      router.push('/products');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading || !product) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  const found = product.offers.filter(o => o.status === 'FOUND');
  const bestOffer = found.find(o => o.url === product.bestUrl);
  const savings = product.highestPrice && product.bestPrice ? product.highestPrice - product.bestPrice : 0;
  // Stores that have never been checked still get a row
  const offerRows = [
    ...product.offers,
    ...product.stores
      .filter(s => !product.offers.some(o => o.store === s.key))
      .map(s => ({ _id: s.key, store: s.key, storeName: s.name, status: 'NOT_FOUND', inStock: false, lastCheckedAt: '' } as Offer)),
  ];

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <button onClick={() => router.back()} className="inline-flex items-center text-sm font-bold text-slate-600 hover:text-indigo-600">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
        </button>

        {/* Summary */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 grid md:grid-cols-[260px_1fr] gap-8">
          <div className="h-64 bg-slate-50 rounded-2xl p-4 flex items-center justify-center">
            <ProductImage src={product.image} alt={product.name} className="h-full w-full" />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="text-indigo-600">{product.brand || 'Product'}</span>
              <span className="text-slate-300">•</span>
              <Link href={`/products?category=${product.category}`} className="text-slate-500 hover:text-indigo-600">{CATEGORY_LABELS[product.category]}</Link>
              {product.origin === 'USER' && <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 normal-case">Added by a user search</span>}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}{product.variant && <span className="text-slate-400 font-bold"> · {product.variant}</span>}
            </h1>

            {!product.lastCheckedAt ? (
              <div className="mt-6 p-5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin mr-3 shrink-0" />
                <div>
                  <p className="font-bold text-indigo-900">Checking {product.stores.map(s => s.name).join(', ')}…</p>
                  <p className="text-sm text-indigo-700 mt-1">This usually takes 10–30 seconds. The page updates automatically.</p>
                </div>
              </div>
            ) : product.bestPrice ? (
              <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Best price</p>
                  <p className="text-4xl font-black text-slate-900">{formatINR(product.bestPrice)}</p>
                  <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center">
                    <Store className="w-4 h-4 mr-1" /> on {product.bestStore}
                    {!product.inStock && <span className="text-rose-500 ml-2">(currently out of stock everywhere)</span>}
                  </p>
                </div>
                {savings > 0 && (
                  <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-700 uppercase">You save</p>
                    <p className="text-xl font-black text-emerald-700">{formatINR(savings)}</p>
                    <p className="text-xs text-emerald-600">vs. the priciest store ({formatINR(product.highestPrice)})</p>
                  </div>
                )}
                {!!product.priceChange && (
                  <div className={`flex items-center font-bold ${product.priceChange < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {product.priceChange < 0 ? <TrendingDown className="w-5 h-5 mr-1" /> : <TrendingUp className="w-5 h-5 mr-1" />}
                    {product.priceChange < 0 ? 'Down' : 'Up'} {formatINR(Math.abs(product.priceChange))} since last check
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-6 text-slate-500 font-medium">None of our stores currently list this exact product.</p>
            )}

            <div className="mt-auto pt-6 flex flex-wrap gap-3">
              {bestOffer?.url && (
                <a href={bestOffer.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors">
                  <ShoppingCart className="w-5 h-5 mr-2" /> Buy on {bestOffer.storeName}
                </a>
              )}
              <button onClick={toggleWatchlist} className={`inline-flex items-center px-5 py-3 rounded-xl font-bold border transition-colors ${product.viewer?.inWatchlist ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                <Heart className={`w-5 h-5 mr-2 ${product.viewer?.inWatchlist ? 'fill-rose-500 text-rose-500' : ''}`} />
                {product.viewer?.inWatchlist ? 'Watching' : 'Watch'}
              </button>
              <button onClick={refresh} disabled={busy || refreshing} className="inline-flex items-center px-5 py-3 rounded-xl font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60">
                <RefreshCw className={`w-5 h-5 mr-2 ${busy || refreshing ? 'animate-spin' : ''}`} />
                {busy ? 'Checking stores…' : 'Refresh prices'}
              </button>
              {user?.role === 'ADMIN' && (
                <button onClick={remove} className="inline-flex items-center px-4 py-3 rounded-xl font-bold text-rose-600 hover:bg-rose-50">
                  <Trash2 className="w-5 h-5 mr-1" /> Delete
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              Last checked {timeAgo(product.lastCheckedAt)}
              {product.lowestEverPrice ? ` · Lowest seen: ${formatINR(product.lowestEverPrice)}` : ''}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Store comparison */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Compare stores</h2>
                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  Found on {found.length} of {product.stores.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead>
                    <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3">Store</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Stock</th>
                      <th className="px-5 py-3">Checked</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {offerRows.map(offer => (
                      <OfferRow key={offer.store} offer={offer} isBest={!!product.bestUrl && offer.url === product.bestUrl} />
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="px-6 py-3 text-xs text-slate-400 border-t border-slate-100">
                Prices include no bank offers or exchange discounts. Always confirm the final price on the store before buying.
              </p>
            </div>

            {/* History */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Price history</h2>
              <div className="h-[300px]">
                <PriceHistoryChart history={history} stores={product.stores} />
              </div>
            </div>
          </div>

          <AlertPanel
            key={product.viewer ? 'in' : 'out'}
            productId={product._id}
            bestPrice={product.bestPrice}
            alerts={product.viewer ? product.viewer.alerts : null}
            onChange={load}
          />
        </div>
      </div>
    </div>
  );
}
