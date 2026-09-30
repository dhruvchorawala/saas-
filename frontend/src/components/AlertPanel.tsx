'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { BellRing, Trash2, Pause, Play, Loader2 } from 'lucide-react';
import api, { apiError } from '../services/api';
import type { AlertRule, AlertType } from '../lib/types';
import { ALERT_TYPE_LABELS, describeAlert } from '../lib/format';

interface Props {
  productId: string;
  bestPrice?: number | null;
  alerts: AlertRule[] | null; // null = not logged in
  onChange: () => void;
}

export default function AlertPanel({ productId, bestPrice, alerts, onChange }: Props) {
  const [type, setType] = useState<AlertType>('TARGET_PRICE');
  const [threshold, setThreshold] = useState(bestPrice ? String(Math.floor(bestPrice * 0.95)) : '');
  const [saving, setSaving] = useState(false);

  const needsThreshold = type === 'TARGET_PRICE' || type === 'PRICE_DROP_PERCENT';

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/alerts', { product: productId, type, threshold: needsThreshold ? Number(threshold) : undefined });
      toast.success('Alert created');
      onChange();
    } catch (err) {
      toast.error(apiError(err, 'Could not create alert'));
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (alert: AlertRule) => {
    try {
      await api.patch(`/alerts/${alert._id}`, { isActive: !alert.isActive });
      onChange();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const remove = async (alert: AlertRule) => {
    try {
      await api.delete(`/alerts/${alert._id}`);
      toast.success('Alert deleted');
      onChange();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-900 flex items-center mb-4">
        <BellRing className="w-5 h-5 mr-2 text-indigo-500" /> Price alerts
      </h3>

      {alerts === null ? (
        <p className="text-sm text-slate-500">
          <Link href="/login" className="font-bold text-indigo-600 hover:underline">Log in</Link> to get notified when this product gets cheaper.
        </p>
      ) : (
        <>
          {alerts.length > 0 && (
            <ul className="space-y-2 mb-5">
              {alerts.map(alert => (
                <li key={alert._id} className={`flex items-center justify-between p-3 rounded-xl border ${alert.isActive ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                  <span className="text-sm font-semibold text-slate-700">{describeAlert(alert.type, alert.threshold)}</span>
                  <span className="flex gap-1 shrink-0 ml-2">
                    <button onClick={() => toggle(alert)} title={alert.isActive ? 'Pause' : 'Resume'} className="p-1.5 rounded-lg text-slate-500 hover:bg-white">
                      {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button onClick={() => remove(alert)} title="Delete" className="p-1.5 rounded-lg text-rose-500 hover:bg-white">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={create} className="space-y-3">
            <select
              value={type}
              onChange={e => setType(e.target.value as AlertType)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {(Object.keys(ALERT_TYPE_LABELS) as AlertType[]).map(t => (
                <option key={t} value={t}>{ALERT_TYPE_LABELS[t]}</option>
              ))}
            </select>
            {needsThreshold && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                  {type === 'TARGET_PRICE' ? '₹' : '%'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={type === 'PRICE_DROP_PERCENT' ? 99 : undefined}
                  required
                  value={threshold}
                  onChange={e => setThreshold(e.target.value)}
                  placeholder={type === 'TARGET_PRICE' ? 'Target price' : 'Drop percentage'}
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-indigo-600 transition-colors disabled:opacity-60"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Create alert
            </button>
            <p className="text-xs text-slate-400">Prices are re-checked every few hours. Triggered alerts appear under Alerts.</p>
          </form>
        </>
      )}
    </div>
  );
}
