const Product = require('../models/Product');
const { refreshProduct } = require('./priceEngine');

const HISTORY_LIMIT = 100;

/**
 * In-process job queue for price refreshes (replaces Redis/BullMQ).
 * - de-duplicates: a product is never queued or refreshed twice at once
 * - user-triggered jobs jump ahead of scheduled ones
 * - keeps a short history for the admin "Jobs" page
 */
class RefreshQueue {
  constructor(concurrency) {
    this.concurrency = concurrency;
    this.pending = [];
    this.active = new Map();
    this.history = [];
    this.totals = { completed: 0, failed: 0 };
    this.nextId = 1;
  }

  /**
   * @param {string} productId
   * @param {{ priority?: 'high' | 'normal', reason?: string }} options
   * @returns {boolean} false when the product is already queued or running
   */
  add(productId, { priority = 'normal', reason = 'manual' } = {}) {
    const id = String(productId);
    if (this.active.has(id)) return false;

    const queued = this.pending.find(job => job.productId === id);
    if (queued) {
      if (priority === 'high' && queued.priority !== 'high') {
        queued.priority = 'high';
        this.sort();
      }
      return false;
    }

    this.pending.push({ id: this.nextId++, productId: id, priority, reason, createdAt: new Date() });
    this.sort();
    Product.updateOne({ _id: id, refreshStatus: { $ne: 'REFRESHING' } }, { refreshStatus: 'PENDING' })
      .catch(() => {});
    setImmediate(() => this.drain());
    return true;
  }

  sort() {
    const rank = job => (job.priority === 'high' ? 0 : 1);
    this.pending.sort((a, b) => rank(a) - rank(b) || a.id - b.id);
  }

  has(productId) {
    const id = String(productId);
    return this.active.has(id) || this.pending.some(job => job.productId === id);
  }

  drain() {
    while (this.active.size < this.concurrency && this.pending.length) {
      const job = this.pending.shift();
      job.startedAt = new Date();
      this.active.set(job.productId, job);
      this.run(job);
    }
  }

  async run(job) {
    try {
      job.result = await refreshProduct(job.productId);
      job.status = 'COMPLETED';
      this.totals.completed++;
    } catch (err) {
      job.status = 'FAILED';
      job.error = err.message;
      this.totals.failed++;
      console.error(`[queue] Refresh of ${job.productId} failed: ${err.message}`);
    } finally {
      job.finishedAt = new Date();
      this.active.delete(job.productId);
      this.history.unshift(job);
      this.history.length = Math.min(this.history.length, HISTORY_LIMIT);
      this.drain();
    }
  }

  stats() {
    return {
      waiting: this.pending.length,
      active: this.active.size,
      completed: this.totals.completed,
      failed: this.totals.failed,
      concurrency: this.concurrency,
    };
  }

  jobs() {
    const view = (job, status) => ({
      id: job.id,
      productId: job.productId,
      priority: job.priority,
      reason: job.reason,
      status,
      createdAt: job.createdAt,
      startedAt: job.startedAt || null,
      finishedAt: job.finishedAt || null,
      error: job.error || null,
      result: job.result || null,
    });
    return [
      ...[...this.active.values()].map(job => view(job, 'ACTIVE')),
      ...this.pending.map(job => view(job, 'WAITING')),
      ...this.history.map(job => view(job, job.status)),
    ];
  }
}

module.exports = new RefreshQueue(Number(process.env.REFRESH_CONCURRENCY) || 2);
