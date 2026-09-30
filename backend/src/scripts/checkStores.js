/**
 * Diagnostic: search the live stores and show what the matcher picks.
 * Does not touch the database.
 *
 *   npm run check-stores -- "Samsung Galaxy S24 128GB"   # one free-text product
 *   npm run check-stores -- --catalog                    # every seed catalog product
 *   npm run check-stores -- --catalog laptops            # one category
 */
require('dotenv').config();
const catalog = require('../seed/catalog');
const { findOffers } = require('../services/priceEngine');
const { describeQuery } = require('../services/discoveryService');
const { closeBrowser } = require('../scrapers/browser');

const inr = n => `₹${Number(n).toLocaleString('en-IN')}`;

async function check(product) {
  const label = [product.brand, product.name, product.variant].filter(Boolean).join(' ');
  const started = Date.now();
  const results = await findOffers(product);
  const found = results.filter(r => r.status === 'FOUND');
  console.log(`\n${label}  [${found.length}/${results.length} stores, ${((Date.now() - started) / 1000).toFixed(1)}s]`);
  for (const r of results) {
    if (r.status === 'FOUND') {
      const l = r.listing;
      console.log(`  ✔ ${r.store.name.padEnd(17)} ${inr(l.price).padEnd(11)} ${l.inStock ? '' : '(out of stock) '}${l.title.slice(0, 90)}`);
    } else if (r.status === 'NOT_FOUND') {
      console.log(`  · ${r.store.name.padEnd(17)} not found (${r.searched} results searched)`);
    } else {
      console.log(`  ✖ ${r.store.name.padEnd(17)} ${r.error}`);
    }
  }
  return found.length;
}

async function main() {
  const args = process.argv.slice(2);
  let products;
  if (args[0] === '--catalog') {
    products = catalog.filter(p => !args[1] || p.category === args[1]);
  } else if (args.length) {
    const query = args.join(' ');
    products = [{ ...describeQuery(query), origin: 'USER', searchQuery: query }];
  } else {
    console.log('Usage: npm run check-stores -- "<product>" | --catalog [category]');
    return;
  }

  const summary = [];
  for (const p of products) {
    const product = { origin: 'CATALOG', ...p, searchQuery: p.searchQuery || p.query || [p.brand, p.name, p.variant].filter(Boolean).join(' ') };
    summary.push([product, await check(product)]);
  }

  if (products.length > 1) {
    console.log('\nSummary (stores found per product):');
    for (const [p, count] of summary) console.log(`  ${count}  ${p.brand} ${p.name} ${p.variant}`);
  }
}

main()
  .catch(err => console.error(err))
  .finally(() => closeBrowser());
