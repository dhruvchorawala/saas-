import { formatDistanceToNow } from 'date-fns';
import type { AlertType, Category } from './types';

export function formatINR(value?: number | null): string {
  if (value === null || value === undefined) return '—';
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export function timeAgo(date?: string | null): string {
  if (!date) return 'never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export const CATEGORY_LABELS: Record<Category, string> = {
  smartphones: 'Smartphones',
  laptops: 'Laptops',
  audio: 'Audio',
  wearables: 'Wearables & Tablets',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  TARGET_PRICE: 'Target price',
  PRICE_DROP_PERCENT: 'Price drops by %',
  BACK_IN_STOCK: 'Back in stock',
  ANY_PRICE_CHANGE: 'Any price change',
};

export function describeAlert(type: AlertType, threshold?: number): string {
  switch (type) {
    case 'TARGET_PRICE':
      return `Notify when the best price is ${formatINR(threshold)} or less`;
    case 'PRICE_DROP_PERCENT':
      return `Notify when the price drops by ${threshold}% or more`;
    case 'BACK_IN_STOCK':
      return 'Notify when any store has it in stock again';
    default:
      return 'Notify on every price change';
  }
}

/** Percentage saved by buying at the best price instead of the highest one. */
export function savingsPercent(best?: number | null, highest?: number | null): number {
  if (!best || !highest || highest <= best) return 0;
  return Math.round(((highest - best) / highest) * 100);
}

// One colour per store, used consistently in tables and charts
export const STORE_COLORS: Record<string, string> = {
  amazon: '#f59e0b',
  flipkart: '#3b82f6',
  reliance: '#ef4444',
  vijaysales: '#10b981',
};
