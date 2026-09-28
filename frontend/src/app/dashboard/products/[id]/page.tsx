'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Package, TrendingDown, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [intelligence, setIntelligence] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [prodRes, histRes, intRes, sellersRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/v1/products/${id}`, { headers }),
        axios.get(`http://localhost:5000/api/v1/products/${id}/history`, { headers }),
        axios.get(`http://localhost:5000/api/v1/products/${id}/intelligence`, { headers }),
        axios.get(`http://localhost:5000/api/v1/products/${id}/sellers`, { headers })
      ]);

      setProduct(prodRes.data.data);
      setIntelligence(intRes.data.data);
      setSellers(sellersRes.data.data);

      // Format history for Recharts
      const chartData = histRes.data.data.map((h: any) => ({
        date: format(new Date(h.createdAt), 'MMM dd, HH:mm'),
        price: h.price
      })).reverse(); // Chronological for chart

      setHistory(chartData);

    } catch (error) {
      console.error('Error fetching product details', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading product intelligence...</div>;
  }

  if (!product) {
    return <div className="p-12 text-center text-red-500">Product not found.</div>;
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 flex items-center mt-1">
            <span className="font-medium text-gray-700 mr-2">{product.brand || 'Unknown Brand'}</span> •
            <span className="mx-2">{product.variant || 'Standard'}</span> •
            <a href={product.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline ml-2">Original URL</a>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Intelligence */}
        <div className="space-y-6">
          {/* Image Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center min-h-[300px]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="max-w-full max-h-[250px] object-contain rounded-lg" />
            ) : (
              <Package className="h-24 w-24 text-gray-300" />
            )}
            <div className="mt-6 text-center w-full">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${product.availability === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {product.availability === 'IN_STOCK' ? 'IN STOCK' : 'OUT OF STOCK'}
              </span>
            </div>
          </div>

          {/* Intelligence Snapshot */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Price Intelligence</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Current</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{intelligence?.currentPrice?.toLocaleString() || '-'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Average</p>
                <p className="text-xl font-bold text-gray-700 mt-1">₹{intelligence?.averagePrice?.toLocaleString() || '-'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Lowest</p>
                <p className="text-lg font-bold text-green-700 mt-1">₹{intelligence?.lowestPrice?.toLocaleString() || '-'}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-xs font-medium text-red-600 uppercase tracking-wider">Highest</p>
                <p className="text-lg font-bold text-red-700 mt-1">₹{intelligence?.highestPrice?.toLocaleString() || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Charts & Sellers */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price History Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Price History Trend</h3>
              {intelligence?.priceChange !== 0 && intelligence?.priceChange !== null && (
                <span className={`inline-flex items-center text-sm font-medium ${intelligence.priceChange < 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {intelligence.priceChange < 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                  {intelligence.priceChangePercentage}%
                </span>
              )}
            </div>

            <div className="h-[300px] w-full">
              {history.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      tickFormatter={(value) => `₹${value}`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Price']}
                    />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm">
                  Not enough historical data to plot.
                </div>
              )}
            </div>
          </div>

          {/* Seller Comparison Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-900">Seller Comparison</h3>
              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{sellers.length} Competitors</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller / Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final Price</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Availability</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {sellers.map((seller) => (
                    <tr key={seller.productId} className={seller.isCheapest ? "bg-indigo-50/30" : "hover:bg-gray-50 transition-colors"}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {seller.isCheapest && <ShoppingCart className="h-4 w-4 text-indigo-600 mr-2" />}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{seller.seller}</div>
                            <div className="text-xs text-gray-500">{seller.source}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        ₹{seller.listedPrice?.toLocaleString()}
                        {seller.discount > 0 && <span className="block text-xs text-green-600">(-₹{seller.discount})</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {seller.isDeliveryChargeKnown ? (
                          <span className="text-gray-900">₹{seller.deliveryCharge}</span>
                        ) : (
                          <span className="flex items-center text-yellow-600 text-xs font-medium">
                            <AlertCircle className="h-3 w-3 mr-1" /> Unknown
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${seller.isCheapest ? 'text-indigo-700 text-base' : 'text-gray-900'}`}>
                          ₹{seller.estimatedFinalPrice?.toLocaleString() || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${seller.availability === 'IN_STOCK' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {seller.availability === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {sellers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                        No competing sellers found for this specific variant.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
