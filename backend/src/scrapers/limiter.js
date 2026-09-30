/**
 * Serialises calls per store and enforces a minimum gap between them,
 * so we stay polite and avoid getting blocked.
 */
class StoreLimiter {
  constructor(minIntervalMs) {
    this.minIntervalMs = minIntervalMs;
    this.tail = Promise.resolve();
    this.lastRun = 0;
  }

  run(task) {
    const result = this.tail.then(async () => {
      const wait = this.lastRun + this.minIntervalMs - Date.now();
      if (wait > 0) await new Promise(resolve => setTimeout(resolve, wait));
      try {
        return await task();
      } finally {
        this.lastRun = Date.now();
      }
    });
    // Keep the chain alive even when a task fails
    this.tail = result.catch(() => {});
    return result;
  }
}

module.exports = StoreLimiter;
