const Product = require('../models/Product');
const refreshQueue = require('./refreshQueue');

const CHECK_EVERY_MS = 15 * 60 * 1000;

function refreshIntervalMs() {
  return (Number(process.env.REFRESH_INTERVAL_HOURS) || 6) * 60 * 60 * 1000;
}

/** Queue every product whose prices are older than the refresh interval (or never fetched). */
async function queueStaleProducts() {
  const cutoff = new Date(Date.now() - refreshIntervalMs());
  const stale = await Product.find({
    $or: [{ lastCheckedAt: null }, { lastCheckedAt: { $lt: cutoff } }],
  }).select('_id').sort({ lastCheckedAt: 1 });

  let queued = 0;
  for (const product of stale) {
    if (refreshQueue.add(product._id, { priority: 'normal', reason: 'scheduled' })) queued++;
  }
  if (queued) console.log(`[scheduler] Queued ${queued} product(s) for a price refresh`);
  return queued;
}

async function start() {
  // Jobs don't survive a restart, so reset products left mid-refresh
  const interrupted = { refreshStatus: { $in: ['REFRESHING', 'PENDING'] } };
  await Product.updateMany({ ...interrupted, lastCheckedAt: { $ne: null } }, { refreshStatus: 'READY' });
  await Product.updateMany({ ...interrupted, lastCheckedAt: null }, { refreshStatus: 'PENDING' });

  if (process.env.ENABLE_SCHEDULER === 'false') {
    console.log('[scheduler] Disabled (ENABLE_SCHEDULER=false)');
    return;
  }

  await queueStaleProducts();
  setInterval(() => {
    queueStaleProducts().catch(err => console.error(`[scheduler] ${err.message}`));
  }, CHECK_EVERY_MS).unref();
  console.log(`[scheduler] Prices refresh every ${refreshIntervalMs() / 3600000}h`);
}

module.exports = { start, queueStaleProducts };
