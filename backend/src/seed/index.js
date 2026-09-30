const Product = require('../models/Product');
const catalog = require('./catalog');
const { productKey } = require('../services/discoveryService');

/**
 * Insert any catalog products that are not in the database yet.
 * Existing products (and their price data) are left untouched, so this is safe to run on every start.
 * @returns {Promise<number>} number of products inserted
 */
async function seedCatalog() {
  const operations = catalog.map(item => {
    const key = productKey(item.brand, item.name, item.variant);
    const fullName = item.name.toLowerCase().startsWith(item.brand.toLowerCase())
      ? item.name
      : `${item.brand} ${item.name}`;
    return {
      updateOne: {
        filter: { key },
        update: {
          $setOnInsert: {
            key,
            name: fullName,
            brand: item.brand,
            category: item.category,
            variant: item.variant,
            searchQuery: item.query || [item.brand, item.name, item.variant].filter(Boolean).join(' '),
            origin: 'CATALOG',
          },
        },
        upsert: true,
      },
    };
  });

  const result = await Product.bulkWrite(operations, { ordered: false });
  return result.upsertedCount;
}

module.exports = { seedCatalog };
