const Product = require('../models/Product');
const Offer = require('../models/Offer');
const PriceHistory = require('../models/PriceHistory');
const { STORES, searchStore } = require('../scrapers/stores');
const { buildProfile, matchListing } = require('./matcher');
const alertService = require('./alertService');

// Listings far from the median matched price are treated as mismatches
// (accessories and EMI amounts below, bundles and wrong configurations above).
const OUTLIER_LOW = 0.5;
const OUTLIER_HIGH = 1.8;
// A store error keeps showing the last good offer for this long
const STALE_OFFER_MS = 48 * 60 * 60 * 1000;

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Prefer in-stock, then organic (non-sponsored) results, then the lowest price. */
function pickBest(listings) {
  return [...listings].sort((a, b) =>
    (b.inStock - a.inStock) || ((a.sponsored ? 1 : 0) - (b.sponsored ? 1 : 0)) || (a.price - b.price)
  )[0];
}

/**
 * Search every store for the product and return the best matching listing per store.
 * Does not touch the database, so it can also be used by diagnostic scripts.
 */
async function findOffers(product) {
  const profile = buildProfile(product);
  // Some store search engines rank better without the storage size, so retry once without it
  const shortQuery = [product.brand, product.name].filter(Boolean).join(' ');
  const queries = [...new Set([product.searchQuery, shortQuery])];

  const results = await Promise.all(STORES.map(async store => {
    try {
      let searched = 0;
      for (const query of queries) {
        const listings = await searchStore(store, query);
        searched += listings.length;
        const matches = listings
          .map(listing => ({ ...listing, match: matchListing(profile, listing.title) }))
          .filter(listing => listing.match.ok);
        if (matches.length) return { store, matches, searched };
      }
      return { store, matches: [], searched };
    } catch (err) {
      return { store, error: err.message };
    }
  }));

  const allPrices = results.flatMap(r => (r.matches || []).map(m => m.price));
  const mid = allPrices.length >= 2 ? median(allPrices) : null;

  return results.map(r => {
    if (r.error) return { store: r.store, status: 'ERROR', error: r.error };
    const plausible = mid
      ? r.matches.filter(m => m.price >= mid * OUTLIER_LOW && m.price <= mid * OUTLIER_HIGH)
      : r.matches;
    if (!plausible.length) return { store: r.store, status: 'NOT_FOUND', searched: r.searched };
    return { store: r.store, status: 'FOUND', listing: pickBest(plausible) };
  });
}

async function saveOffer(product, result, now) {
  const { store } = result;
  const filter = { product: product._id, store: store.key };

  if (result.status === 'FOUND') {
    const { listing } = result;
    await Offer.findOneAndUpdate(filter, {
      storeName: store.name,
      status: 'FOUND',
      title: listing.title,
      url: listing.url,
      image: listing.image,
      price: listing.price,
      mrp: listing.mrp,
      inStock: listing.inStock,
      matchScore: listing.match.score,
      error: null,
      lastCheckedAt: now,
    }, { upsert: true });
    await PriceHistory.create({
      product: product._id,
      store: store.key,
      price: listing.price,
      mrp: listing.mrp,
      inStock: listing.inStock,
      capturedAt: now,
    });
    return;
  }

  if (result.status === 'ERROR') {
    // Keep a recent good offer visible; just record that this check failed
    const existing = await Offer.findOne(filter);
    if (existing && existing.status === 'FOUND' && now - existing.lastCheckedAt < STALE_OFFER_MS) {
      existing.error = result.error;
      await existing.save();
      return;
    }
  }

  await Offer.findOneAndUpdate(filter, {
    storeName: store.name,
    status: result.status,
    title: null,
    url: null,
    price: null,
    mrp: null,
    inStock: false,
    matchScore: null,
    error: result.error || null,
    lastCheckedAt: now,
  }, { upsert: true });
}

/** Recompute the product's best-price fields from its current offers. */
async function updateAggregates(product, now) {
  const offers = await Offer.find({ product: product._id, status: 'FOUND' });
  const inStock = offers.filter(o => o.inStock);
  const pool = inStock.length ? inStock : offers;
  const best = pool.reduce((min, o) => (!min || o.price < min.price ? o : min), null);

  const previousBestPrice = product.bestPrice;
  const update = {
    storeCount: offers.length,
    inStock: inStock.length > 0,
    lastCheckedAt: now,
  };

  if (best) {
    update.bestPrice = best.price;
    update.bestStore = best.storeName;
    update.bestUrl = best.url;
    update.highestPrice = Math.max(...offers.map(o => o.price));
    const mrps = offers.map(o => o.mrp).filter(Boolean);
    update.mrp = mrps.length ? Math.max(...mrps) : null;
    update.lowestEverPrice = Math.min(best.price, product.lowestEverPrice || Infinity);
    if (!product.image) {
      // Store CDNs that allow hot-linking, in order of image quality
      const withImage = ['reliance', 'vijaysales', 'amazon', 'flipkart']
        .map(key => offers.find(o => o.store === key && o.image))
        .find(Boolean);
      if (withImage) update.image = withImage.image;
    }
    if (previousBestPrice) {
      update.previousBestPrice = previousBestPrice;
      update.priceChange = best.price - previousBestPrice;
      update.priceChangePercentage = Number((((best.price - previousBestPrice) / previousBestPrice) * 100).toFixed(2));
    }
  } else {
    update.bestPrice = null;
    update.bestStore = null;
    update.bestUrl = null;
    update.highestPrice = null;
  }

  return Product.findByIdAndUpdate(product._id, update, { returnDocument: 'after' });
}

/**
 * Full refresh of one product: search all stores, store offers + history,
 * update aggregates and fire any alerts.
 */
async function refreshProduct(productId) {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Product not found');

  const before = { bestPrice: product.bestPrice, inStock: product.inStock, checked: !!product.lastCheckedAt };
  await Product.updateOne({ _id: product._id }, { refreshStatus: 'REFRESHING' });

  try {
    const results = await findOffers(product);
    const now = new Date();
    for (const result of results) {
      await saveOffer(product, result, now);
    }

    const updated = await updateAggregates(product, now);
    const errors = results.filter(r => r.status === 'ERROR');
    const allFailed = errors.length === results.length;

    updated.refreshStatus = allFailed ? 'FAILED' : 'READY';
    updated.lastError = errors.length ? errors.map(r => `${r.store.name}: ${r.error}`).join('; ') : null;
    await updated.save();

    if (before.checked) {
      await alertService.evaluate(updated, before);
    }

    const found = results.filter(r => r.status === 'FOUND').length;
    return { found, errors: errors.length, bestPrice: updated.bestPrice };
  } catch (err) {
    await Product.updateOne({ _id: product._id }, { refreshStatus: 'FAILED', lastError: err.message });
    throw err;
  }
}

module.exports = { refreshProduct, findOffers };
