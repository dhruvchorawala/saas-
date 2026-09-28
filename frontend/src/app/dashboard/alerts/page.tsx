'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BellRing, Trash2, Plus, Package, Loader2, AlertTriangle, TrendingDown } from 'lucide-react';

interface Alert {
  _id: string;
  type: string;
  threshold: number;
  isActive: boolean;
  product: { _id: string, name: string, image?: string };
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/v1/alerts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(res.data.data);
    } catch (error) {
      console.error('Error fetching alerts', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/v1/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlerts(alerts.filter(a => a._id !== id));
    } catch (error) {
      console.error('Error deleting alert', error);
    }
  };

  const getAlertText = (type: string, threshold: number) => {
    switch (type) {
      case 'TARGET_PRICE':
        return `Target Price: ₹${threshold.toLocaleString()}`;
      case 'PRICE_DROP_PERCENT':
        return `Price Drop: >${threshold}%`;
      case 'BACK_IN_STOCK':
        return 'Back in Stock';
      case 'ANY_PRICE_CHANGE':
        return 'Any Price Change';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Active Alerts</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Manage notifications for price drops and restocks.</p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
          <Plus className="h-5 w-5 mr-2" />
          New Alert
        </button>
      </div>

      {/* Insight Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 border border-white/60 flex items-start space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <BellRing className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Total Active Alerts</p>
            <p className="text-2xl font-bold text-slate-900">{alerts.length}</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/60 flex items-start space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Price Drops Caught</p>
            <p className="text-2xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/60 flex items-start space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">Action Required</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="glass rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading your alerts...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellRing className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No active alerts</h3>
            <p className="text-slate-500 mt-1 max-w-sm mx-auto">Set up an alert on any product page to get notified instantly of price drops or restocks.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100/50">
            {alerts.map((alert) => (
              <div key={alert._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-white/50 transition-colors group">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="h-14 w-14 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 p-2">
                    {alert.product?.image ? (
                      <img src={alert.product.image} className="h-full w-full object-contain" alt={alert.product.name} />
                    ) : (
                      <Package className="h-6 w-6 text-slate-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{alert.product?.name || 'Unknown Product'}</h3>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {getAlertText(alert.type, alert.threshold)}
                      </span>
                      {alert.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-50 text-slate-600 border border-slate-200">Paused</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end sm:ml-4 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteAlert(alert._id)}
                    className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all hover:shadow-sm"
                    title="Delete Alert"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
