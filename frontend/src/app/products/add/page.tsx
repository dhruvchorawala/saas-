'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Link as LinkIcon, FileText, Plus, Loader2, Tag, Box, 
  Search, DollarSign, PackageCheck, Database, CheckCircle2,
  ExternalLink,
  Zap
} from 'lucide-react';

const TRACKING_STEPS = [
  { id: 1, name: 'Product Identify', icon: Search, description: 'Parsing URL and verifying domain' },
  { id: 2, name: 'Price Collect', icon: DollarSign, description: 'Extracting current price and MRP' },
  { id: 3, name: 'Availability Check', icon: PackageCheck, description: 'Checking real-time stock status' },
  { id: 4, name: 'Store Database', icon: Database, description: 'Securing tracking configuration' }
];

export default function AddProductPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'url' | 'manual'>('url');
  
  // URL Tab state
  const [url, setUrl] = useState('');
  
  // Manual Tab state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [trackingStep, setTrackingStep] = useState<number>(-1);
  const [scrapedProduct, setScrapedProduct] = useState<any>(null);

  const startPolling = async (productId: string) => {
    // Start step 1
    setTrackingStep(1);
    
    let attempts = 0;
    const maxAttempts = 20; // 20 * 1.5s = 30 seconds max
    
    const interval = setInterval(async () => {
      try {
        attempts++;
        const res = await api.get(`/products/${productId}`);
        const data = res.data.data;

        if (data.name?.startsWith('Scrape Failed')) {
          clearInterval(interval);
          toast.error(data.name || 'Failed to extract product details from this URL.');
          setTrackingStep(-1);
          setLoading(false);
        } else if (data.name !== 'Resolving from URL...') {
          // Scrape finished successfully!
          clearInterval(interval);
          setTrackingStep(5); // Complete all steps
          setScrapedProduct(data);
          setLoading(false);
          toast.success('Product details extracted successfully!');
        } else {
          // Still resolving, advance visual steps slowly
          if (attempts === 2) setTrackingStep(2);
          if (attempts === 4) setTrackingStep(3);
          if (attempts === 6) setTrackingStep(4);
          
          if (attempts >= maxAttempts) {
            clearInterval(interval);
            toast.error('Scraping is taking longer than expected. We will notify you when it completes.');
            setLoading(false);
            router.push(`/products/${productId}`);
          }
        }
      } catch (err) {
        clearInterval(interval);
        toast.error('Error fetching product status.');
        setTrackingStep(-1);
        setLoading(false);
      }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setScrapedProduct(null);
    
    // If URL tab, show the step-by-step wizard
    if (activeTab === 'url') {
      setTrackingStep(0);
    }

    let finalUrl = url.trim();
    if (activeTab === 'url' && finalUrl) {
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = `https://${finalUrl}`;
      }
    }

    const payload = activeTab === 'url' ? { url: finalUrl, name: 'Resolving from URL...' } : { name, brand, category };

    try {
      const res = await api.post('/products', payload);
      
      if (activeTab === 'url') {
        // Start live polling instead of fake timeout
        startPolling(res.data.data._id);
      } else {
        toast.success('Product added successfully!');
        router.push(`/products/${res.data.data._id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add product');
      setLoading(false);
      setTrackingStep(-1); // Reset wizard on error
    }
  };

  return (
    <div className="min-h-screen mesh-bg pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between animate-fade-in-up">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Track New Product</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Add a product to your watchlist via URL or manually.</p>
          </div>
          <Link href="/products" className="inline-flex items-center px-4 py-2 bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl text-sm font-bold text-slate-700 hover:bg-white transition-all shadow-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Link>
        </div>

        {/* Main Card */}
        <div className="glass rounded-3xl overflow-hidden border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          
          {trackingStep === -1 ? (
            <>
              {/* Tabs */}
              <div className="flex p-2 bg-slate-50/50 border-b border-slate-100">
                <button
                  onClick={() => setActiveTab('url')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'url'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <LinkIcon className="w-4 h-4 mr-2" /> Add via URL
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`flex-1 flex items-center justify-center py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                    activeTab === 'manual'
                      ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                  }`}
                >
                  <FileText className="w-4 h-4 mr-2" /> Add Manually
                </button>
              </div>

              <div className="p-8 sm:p-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {activeTab === 'url' ? (
                    <div className="animate-fade-in">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Product URL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <LinkIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="https://www.amazon.com/dp/B08N5WRWNW"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          className="block w-full pl-11 pr-4 py-4 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 outline-none shadow-sm"
                        />
                      </div>
                      <div className="mt-4 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="ml-3 text-sm text-indigo-700 font-medium">
                          Paste the direct link to the product. Our real-time scraper will extract pricing, stock, and variants automatically.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5 animate-fade-in">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Product Name *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Box className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Apple MacBook Air M1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 outline-none shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Brand</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Tag className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Apple"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 outline-none shadow-sm"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <FileText className="h-5 w-5 text-slate-400" />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. Laptops"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-900 outline-none shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center justify-center px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:bg-slate-900 w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Initializing...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 mr-2" />
                          Track Product
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Step-by-Step Wizard View / Live Preview */
            <div className="p-8 sm:p-12 animate-fade-in flex flex-col items-center">
              
              {!scrapedProduct ? (
                <>
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-indigo-100">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 mb-2">Live Extraction</h2>
                  <p className="text-slate-500 text-sm mb-10 text-center max-w-sm">
                    Our engines are actively analyzing the URL and extracting product intelligence. Please hold on.
                  </p>

                  <div className="w-full max-w-md space-y-6">
                    {TRACKING_STEPS.map((step) => {
                      const isActive = trackingStep === step.id;
                      const isCompleted = trackingStep > step.id;
                      const Icon = step.icon;

                      return (
                        <div 
                          key={step.id} 
                          className={`flex items-center p-4 rounded-2xl border transition-all duration-500 ${
                            isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm scale-[1.02]' :
                            isCompleted ? 'bg-green-50/50 border-green-100' :
                            'bg-slate-50/50 border-slate-100 opacity-60'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-500 ${
                            isActive ? 'bg-indigo-600 text-white shadow-md' :
                            isCompleted ? 'bg-green-500 text-white' :
                            'bg-slate-200 text-slate-400'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                          </div>
                          <div className="ml-4 flex-1">
                            <h3 className={`text-sm font-bold ${
                              isActive ? 'text-indigo-900' :
                              isCompleted ? 'text-green-900' :
                              'text-slate-500'
                            }`}>
                              {step.id}. {step.name}
                            </h3>
                            <p className={`text-xs mt-0.5 ${
                              isActive ? 'text-indigo-600' :
                              isCompleted ? 'text-green-700' :
                              'text-slate-400'
                            }`}>
                              {isActive ? (
                                <span className="flex items-center">
                                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping mr-2"></span>
                                  Processing...
                                </span>
                              ) : isCompleted ? (
                                'Completed'
                              ) : (
                                step.description
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* LIVE PREVIEW CARD */
                <div className="w-full max-w-lg animate-fade-in-up">
                  <div className="flex items-center justify-center mb-6 text-emerald-600">
                    <CheckCircle2 className="w-16 h-16 mr-3" />
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Extraction Complete</h2>
                      <p className="text-slate-500 font-medium text-sm">Product is now actively monitored</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="w-32 h-32 bg-slate-50 rounded-2xl p-2 shrink-0 border border-slate-100 flex items-center justify-center overflow-hidden">
                        {scrapedProduct.image ? (
                          <img src={scrapedProduct.image} alt={scrapedProduct.name} className="w-full h-full object-contain" />
                        ) : (
                          <Box className="w-12 h-12 text-slate-300" />
                        )}
                      </div>
                      
                      <div className="flex-1 text-center sm:text-left">
                        {scrapedProduct.brand && (
                          <span className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1 block">
                            {scrapedProduct.brand}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-slate-900 leading-tight mb-3 line-clamp-2" title={scrapedProduct.name}>
                          {scrapedProduct.name}
                        </h3>
                        
                        <div className="flex items-center justify-center sm:justify-start gap-4 mb-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Current Price</span>
                            <span className="text-xl font-black text-slate-900">
                              {scrapedProduct.currency || '$'}{scrapedProduct.currentPrice || scrapedProduct.price}
                            </span>
                          </div>
                          
                          {scrapedProduct.availability && (
                            <div className="flex flex-col border-l border-slate-200 pl-4">
                              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Availability</span>
                              <span className={`text-sm font-bold mt-1 inline-flex items-center ${
                                scrapedProduct.availability.toLowerCase().includes('in stock') || scrapedProduct.availability === 'IN_STOCK' ? 'text-emerald-600' : 'text-rose-500'
                              }`}>
                                {scrapedProduct.availability}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {scrapedProduct.effectivePrice > 0 && scrapedProduct.shippingCost > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-start bg-amber-50 p-3 rounded-xl">
                        <Zap className="w-4 h-4 text-amber-500 mt-0.5 mr-2 shrink-0" />
                        <p className="text-xs text-amber-700 font-medium">
                          <strong>Hidden Cost Detected:</strong> We found a shipping cost of {scrapedProduct.currency}{scrapedProduct.shippingCost}. 
                          The true effective price is <span className="font-bold">{scrapedProduct.currency}{scrapedProduct.effectivePrice}</span>.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={() => { setTrackingStep(-1); setUrl(''); setLoading(false); }}
                      className="flex-1 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
                    >
                      Track Another
                    </button>
                    <Link
                      href={`/products/${scrapedProduct._id}`}
                      className="flex-1 flex justify-center items-center px-6 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      View Full Details <ExternalLink className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
