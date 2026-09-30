const StoreLimiter = require('../limiter');

// Every store we compare. To add a store, create an adapter exposing
// { key, name, domain, minIntervalMs, search(query) } and register it here.
const STORES = [
  require('./amazon'),
  require('./flipkart'),
  require('./relianceDigital'),
  require('./vijaySales'),
];

const limiters = new Map(STORES.map(store => [store.key, new StoreLimiter(store.minIntervalMs)]));

/** Run a store search through that store's rate limiter. */
function searchStore(store, query) {
  return limiters.get(store.key).run(() => store.search(query));
}

function getStore(key) {
  return STORES.find(store => store.key === key);
}

module.exports = { STORES, searchStore, getStore };
