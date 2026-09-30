'use client';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoryPoint } from '../lib/types';
import { STORE_COLORS, formatINR } from '../lib/format';

interface Props {
  history: HistoryPoint[];
  stores: { key: string; name: string }[];
}

/** One line per store; points from the same refresh share an x position. */
export default function PriceHistoryChart({ history, stores }: Props) {
  const { rows, activeStores } = useMemo(() => {
    const byTime = new Map<string, Record<string, number | string>>();
    for (const point of history) {
      // A refresh writes all stores within a few seconds: bucket them per minute
      const bucket = new Date(point.capturedAt);
      bucket.setSeconds(0, 0);
      const key = bucket.toISOString();
      const row = byTime.get(key) || { time: bucket.getTime() };
      row[point.store] = point.price;
      byTime.set(key, row);
    }
    const present = new Set(history.map(p => p.store));
    return {
      rows: Array.from(byTime.values()).sort((a, b) => Number(a.time) - Number(b.time)),
      activeStores: stores.filter(s => present.has(s.key)),
    };
  }, [history, stores]);

  if (rows.length < 2) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-sm px-6">
        <p className="font-semibold text-slate-500">Not enough history yet</p>
        <p className="mt-1">Prices are re-checked every few hours. The trend appears after the next check.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={rows} margin={{ top: 10, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={['dataMin', 'dataMax']}
          tickFormatter={t => format(new Date(t), 'dd MMM')}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          dy={8}
        />
        <YAxis
          domain={['auto', 'auto']}
          tickFormatter={v => `₹${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}k`}
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#94a3b8', fontSize: 12 }}
          width={56}
        />
        <Tooltip
          labelFormatter={t => format(new Date(Number(t)), 'dd MMM yyyy, HH:mm')}
          formatter={(value, name) => [formatINR(Number(value)), stores.find(s => s.key === name)?.name || String(name)]}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.15)' }}
        />
        <Legend formatter={name => stores.find(s => s.key === name)?.name || name} />
        {activeStores.map(store => (
          <Line
            key={store.key}
            type="stepAfter"
            dataKey={store.key}
            stroke={STORE_COLORS[store.key] || '#6366f1'}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
