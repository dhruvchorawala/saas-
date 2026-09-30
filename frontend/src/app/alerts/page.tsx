'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BellRing, BellOff, CheckCheck, Loader2, Mail, Pause, Play, Trash2 } from 'lucide-react';
import api, { apiError } from '../../services/api';
import RequireAuth from '../../components/RequireAuth';
import ProductImage from '../../components/ProductImage';
import type { AlertRule, Notification, Product } from '../../lib/types';
import { describeAlert, formatINR, timeAgo } from '../../lib/format';

type AlertProduct = Pick<Product, '_id' | 'name' | 'image' | 'bestPrice' | 'bestStore' | 'inStock'>;

function Alerts() {
  const [alerts, setAlerts] = useState<AlertRule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [alertRes, notificationRes] = await Promise.all([api.get('/alerts'), api.get('/notifications')]);
      setAlerts(alertRes.data.data);
      setNotifications(notificationRes.data.data);
      // Opening this page counts as reading the notifications
      if (notificationRes.data.unread > 0) api.patch('/notifications/read-all').catch(() => {});
    } catch (err) {
      toast.error(apiError(err, 'Could not load alerts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = async (alert: AlertRule) => {
    try {
      await api.patch(`/alerts/${alert._id}`, { isActive: !alert.isActive });
      setAlerts(alerts.map(a => (a._id === alert._id ? { ...a, isActive: !a.isActive } : a)));
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const remove = async (alert: AlertRule) => {
    try {
      await api.delete(`/alerts/${alert._id}`);
      setAlerts(alerts.filter(a => a._id !== alert._id));
      toast.success('Alert deleted');
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  if (loading) {
    return <div className="min-h-screen mesh-bg flex items-center justify-center"><Loader2 className="w-10 h-10 text-indigo-500 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen mesh-bg pt-28 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center">
            <span className="bg-indigo-100 p-2.5 rounded-xl mr-4"><BellRing className="h-7 w-7 text-indigo-600" /></span>
            Price alerts
          </h1>
          <p className="text-slate-500 mt-2">
            Create alerts from any product page. We check prices every few hours and notify you here
            {' '}(and by email if the server has email configured).
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Notifications */}
          <section className="lg:col-span-2">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <CheckCheck className="w-5 h-5 mr-2 text-emerald-500" /> Notifications
            </h2>
            {notifications.length === 0 ? (
              <div className="bg-white/80 rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                No alerts have fired yet. You’ll see them here as soon as a price matches one of your alerts.
              </div>
            ) : (
              <ul className="space-y-3">
                {notifications.map(n => (
                  <li key={n._id} className={`bg-white rounded-2xl border p-4 ${n.read ? 'border-slate-100' : 'border-indigo-200 ring-2 ring-indigo-500/10'}`}>
                    <p className="text-sm font-semibold text-slate-800">{n.message}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                      <span>{timeAgo(n.createdAt)}</span>
                      <span className="flex items-center gap-3">
                        {n.emailStatus === 'SENT' && <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1" />emailed</span>}
                        {n.product && <Link href={`/products/${n.product._id}`} className="font-bold text-indigo-600 hover:underline">View product</Link>}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Rules */}
          <section className="lg:col-span-3">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Your alerts ({alerts.length})</h2>
            {alerts.length === 0 ? (
              <div className="bg-white/80 rounded-2xl border border-dashed border-slate-200 p-10 text-center">
                <BellOff className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 font-semibold mb-4">You haven’t set any alerts.</p>
                <Link href="/products" className="inline-flex px-5 py-2.5 bg-indigo-600 text-white rounded-full font-bold text-sm hover:bg-indigo-700">
                  Find a product
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {alerts.map(alert => {
                  const product = alert.product as AlertProduct;
                  return (
                    <li key={alert._id} className={`bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4 ${alert.isActive ? '' : 'opacity-60'}`}>
                      <Link href={`/products/${product._id}`} className="w-14 h-14 rounded-xl bg-slate-50 p-1.5 shrink-0">
                        <ProductImage src={product.image} alt={product.name} className="w-full h-full" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/products/${product._id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 line-clamp-1">{product.name}</Link>
                        <p className="text-xs font-semibold text-indigo-600 mt-0.5">{describeAlert(alert.type, alert.threshold)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Now {formatINR(product.bestPrice)}{product.bestStore ? ` on ${product.bestStore}` : ''}
                          {alert.lastTriggeredAt ? ` · last fired ${timeAgo(alert.lastTriggeredAt)}` : ''}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => toggle(alert)} title={alert.isActive ? 'Pause' : 'Resume'} className="p-2 rounded-lg text-slate-500 hover:bg-slate-100">
                          {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => remove(alert)} title="Delete" className="p-2 rounded-lg text-rose-500 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AlertsPage() {
  return (
    <RequireAuth>
      <Alerts />
    </RequireAuth>
  );
}
