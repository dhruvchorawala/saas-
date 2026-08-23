'use client';
import { useState, useEffect } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [trackingStatus, setTrackingStatus] = useState('ACTIVE');

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}`);
      const p = res.data.data;
      setProduct(p);
      setName(p.name);
      setBrand(p.brand || '');
      setCategory(p.category || '');
      setTrackingStatus(p.trackingStatus);
    } catch (err: any) {
      toast.error('Product not found');
      router.push('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/products/${params.id}`, { name, brand, category, trackingStatus });
      setProduct(res.data.data);
      toast.success('Product updated');
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to stop tracking and delete this product?')) {
      try {
        await api.delete(`/products/${params.id}`);
        toast.success('Product deleted');
        router.push('/products');
      } catch (err: any) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleAddToWatchlist = async () => {
    try {
      await api.post('/watchlist', { productId: params.id });
      toast.success('Added to watchlist');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not add to watchlist');
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Products</Link>
        <div className="flex space-x-3">
          <button onClick={handleAddToWatchlist} className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            ⭐ Add to Watchlist
          </button>
          <button onClick={() => setIsEditing(!isEditing)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            {isEditing ? 'Cancel Edit' : 'Edit'}
          </button>
          <button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex items-center">
          <div className="h-24 w-24 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center mr-6">
            {product.image === 'no-photo.jpg' ? (
              <span className="text-gray-400 text-sm">No Image</span>
            ) : (
              <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
            )}
          </div>
          <div>
            <h3 className="text-2xl leading-6 font-bold text-gray-900">{product.name}</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">{product.sourceId?.name || 'Manual Entry'}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdate} className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={trackingStatus} onChange={(e) => setTrackingStatus(e.target.value)} className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border bg-white">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="PAUSED">PAUSED</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-sm">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Brand</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.brand || '-'}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{product.category || '-'}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Tracking URL</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {product.url ? <a href={product.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline break-all">{product.url}</a> : 'N/A'}
                </dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.trackingStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {product.trackingStatus}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
