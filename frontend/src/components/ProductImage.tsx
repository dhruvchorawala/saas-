'use client';
import { useState } from 'react';
import { Package } from 'lucide-react';

/** Store CDN image with a neutral placeholder when missing or blocked. */
export default function ProductImage({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 text-slate-300 ${className}`}>
        <Package className="w-1/3 h-1/3" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`object-contain ${className}`}
    />
  );
}
