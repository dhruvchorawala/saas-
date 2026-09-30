export type Category = 'smartphones' | 'laptops' | 'audio' | 'wearables';
export type RefreshStatus = 'PENDING' | 'REFRESHING' | 'READY' | 'FAILED';
export type AlertType = 'TARGET_PRICE' | 'PRICE_DROP_PERCENT' | 'BACK_IN_STOCK' | 'ANY_PRICE_CHANGE';

export interface Product {
  _id: string;
  name: string;
  brand?: string;
  category: Category;
  variant?: string;
  image?: string;
  origin: 'CATALOG' | 'USER';
  bestPrice?: number | null;
  bestStore?: string | null;
  bestUrl?: string | null;
  highestPrice?: number | null;
  mrp?: number | null;
  storeCount: number;
  inStock: boolean;
  priceChange?: number;
  priceChangePercentage?: number;
  lowestEverPrice?: number;
  refreshStatus: RefreshStatus;
  lastCheckedAt?: string | null;
  lastError?: string | null;
  createdAt: string;
}

export interface Offer {
  _id: string;
  store: string;
  storeName: string;
  status: 'FOUND' | 'NOT_FOUND' | 'ERROR';
  title?: string;
  url?: string;
  image?: string;
  price?: number;
  mrp?: number;
  inStock: boolean;
  matchScore?: number;
  error?: string;
  lastCheckedAt: string;
}

export interface AlertRule {
  _id: string;
  type: AlertType;
  threshold?: number;
  isActive: boolean;
  lastTriggeredAt?: string;
  createdAt: string;
  product: string | Pick<Product, '_id' | 'name' | 'image' | 'bestPrice' | 'bestStore' | 'inStock' | 'category'>;
}

export interface ProductDetail extends Product {
  offers: Offer[];
  isQueued: boolean;
  stores: { key: string; name: string }[];
  viewer: { inWatchlist: boolean; alerts: AlertRule[] } | null;
}

export interface Notification {
  _id: string;
  message: string;
  read: boolean;
  emailStatus: 'NOT_CONFIGURED' | 'SENT' | 'FAILED';
  createdAt: string;
  product?: { _id: string; name: string; image?: string } | null;
}

export interface HistoryPoint {
  store: string;
  price: number;
  mrp?: number;
  inStock?: boolean;
  capturedAt: string;
}
