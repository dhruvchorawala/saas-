'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BellRing, Trash2, Plus, Package } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Active Alerts</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your price and availability notifications</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 rounded-lg text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus className="h-4 w-4 mr-2" />
          New Alert
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-16 text-center">
            <BellRing className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active alerts</h3>
            <p className="text-gray-500 mt-1">Set up an alert on any product page to get notified of price drops.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map((alert) => (
              <div key={alert._id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {alert.product?.image ? (
                      <img src={alert.product.image} className="h-10 w-10 object-contain" alt="" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{alert.product?.name || 'Unknown Product'}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        {getAlertText(alert.type, alert.threshold)}
                      </span>
                      {alert.isActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Paused</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end sm:ml-4">
                  <button 
                    onClick={() => deleteAlert(alert._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
