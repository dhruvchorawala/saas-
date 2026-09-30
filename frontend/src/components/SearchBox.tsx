'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Link2 } from 'lucide-react';

const isUrl = (text: string) => /^https?:\/\//i.test(text.trim()) || /^(www\.)?(amazon\.in|flipkart\.com|reliancedigital\.in|vijaysales\.com)\//i.test(text.trim());

/**
 * One box for both kinds of input: a product name searches the catalog,
 * a store link goes straight to price discovery.
 */
export default function SearchBox({ initial = '', size = 'md' }: { initial?: string; size?: 'md' | 'lg' }) {
  const router = useRouter();
  const [text, setText] = useState(initial);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    if (isUrl(value)) {
      const url = value.startsWith('http') ? value : `https://${value}`;
      router.push(`/products/add?url=${encodeURIComponent(url)}`);
    } else {
      router.push(`/products?search=${encodeURIComponent(value)}`);
    }
  };

  const big = size === 'lg';
  return (
    <form onSubmit={submit} className={`glass flex items-center rounded-2xl border border-white/60 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/20 transition-all shadow-sm ${big ? 'p-2.5' : 'p-1.5'}`}>
      <div className="pl-3 pr-2 text-indigo-500">
        {isUrl(text) ? <Link2 className={big ? 'w-6 h-6' : 'w-5 h-5'} /> : <Search className={big ? 'w-6 h-6' : 'w-5 h-5'} />}
      </div>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Search a product (e.g. iPhone 17 256GB) or paste an Amazon / Flipkart link"
        className={`flex-1 min-w-0 bg-transparent outline-none text-slate-900 placeholder-slate-400 font-semibold ${big ? 'py-3 text-base' : 'py-2 text-sm'}`}
      />
      <button
        type="submit"
        className={`shrink-0 bg-slate-900 hover:bg-indigo-600 text-white font-bold rounded-xl transition-colors ${big ? 'px-6 py-3' : 'px-4 py-2 text-sm'}`}
      >
        {isUrl(text) ? 'Compare' : 'Search'}
      </button>
    </form>
  );
}
