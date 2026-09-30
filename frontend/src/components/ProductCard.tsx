import Link from 'next/link';
import { Loader2, Store, TrendingDown, TrendingUp, X } from 'lucide-react';
import type { Product } from '../lib/types';
import { CATEGORY_LABELS, formatINR, savingsPercent } from '../lib/format';
import ProductImage from './ProductImage';

interface Props {
  product: Product;
  onRemove?: (id: string) => void;
}

export default function ProductCard({ product, onRemove }: Props) {
  const fetching = !product.lastCheckedAt && (product.refreshStatus === 'PENDING' || product.refreshStatus === 'REFRESHING');
  const saving = savingsPercent(product.bestPrice, product.highestPrice);

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      {onRemove && (
        <button
          onClick={() => onRemove(product._id)}
          title="Remove from watchlist"
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/90 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <Link href={`/products/${product._id}`} className="flex flex-col flex-1">
        <div className="relative h-44 bg-slate-50/60 p-4 flex items-center justify-center">
          <ProductImage src={product.image} alt={product.name} className="h-full w-full group-hover:scale-105 transition-transform duration-300" />
          {saving >= 3 && (
            <span className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-bold shadow-sm">
              Save {saving}%
            </span>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-1">
            <span className="text-indigo-600">{product.brand || 'Product'}</span>
            <span className="text-slate-400">{CATEGORY_LABELS[product.category]}</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]" title={product.name}>
            {product.name}
            {product.variant ? <span className="text-slate-500 font-semibold"> · {product.variant}</span> : null}
          </h3>

          <div className="mt-auto pt-3">
            {fetching ? (
              <div className="flex items-center text-sm font-semibold text-indigo-600">
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching prices…
              </div>
            ) : product.bestPrice ? (
              <>
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase">Best price</span>
                    <div className="text-xl font-black text-slate-900">{formatINR(product.bestPrice)}</div>
                  </div>
                  {!!product.priceChange && (
                    <span className={`flex items-center text-xs font-bold ${product.priceChange < 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {product.priceChange < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
                      {formatINR(Math.abs(product.priceChange))}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="flex items-center font-semibold text-slate-600">
                    <Store className="w-3.5 h-3.5 mr-1 text-slate-400" /> {product.bestStore}
                  </span>
                  <span className="text-slate-400 font-medium">
                    {product.storeCount} {product.storeCount === 1 ? 'store' : 'stores'}
                    {!product.inStock && <span className="text-rose-500 font-semibold"> · out of stock</span>}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm font-medium text-slate-400">Not currently listed by our stores</p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
