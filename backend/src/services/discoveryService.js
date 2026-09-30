const cheerio = require('cheerio');
const Product = require('../models/Product');
const { fetchText } = require('../scrapers/http');
const { renderPage } = require('../scrapers/browser');
const { STORES } = require('../scrapers/stores');
const { tokenize, normalize, titleHead, detectBrand, capacitiesOf } = require('./matcher');

// Marketing words dropped when turning a store title into a product name
const TITLE_NOISE = new Set([
  '5g', '4g', 'ai', 'smartphone', 'smart', 'phone', 'mobile', 'dual', 'sim', 'with', 'and',
  'the', 'new', 'latest', 'laptop', 'thin', 'light', 'gaming', 'true', 'wireless', 'bluetooth',
  'earbuds', 'headphones', 'over', 'ear', 'in', 'on', 'active', 'noise', 'cancelling', 'unlocked',
  // Page-title and colour words ("Buy Apple iPhone 15 128GB Yellow Online")
  'buy', 'online', 'price', 'best', 'at', 'india', 'black', 'white', 'blue', 'green', 'yellow', 'pink',
  'purple', 'red', 'silver', 'grey', 'gray', 'gold', 'midnight', 'starlight', 'titanium', 'graphite',
]);

const CATEGORY_HINTS = [
  { category: 'laptops', words: ['laptop', 'macbook', 'notebook', 'vivobook', 'zenbook', 'ideapad', 'thinkpad', 'inspiron', 'pavilion', 'victus', 'aspire', 'chromebook', 'vostro', 'yoga', 'omen', 'rog', 'tuf'] },
  { category: 'audio', words: ['headphones', 'headphone', 'earbuds', 'earphones', 'airpods', 'buds', 'speaker', 'soundbar', 'headset', 'neckband', 'wh', 'wf'] },
  { category: 'wearables', words: ['watch', 'smartwatch', 'band', 'ipad', 'tab', 'tablet', 'pad'] },
];

function guessCategory(text) {
  const tokens = tokenize(text);
  const hit = CATEGORY_HINTS.find(hint => hint.words.some(w => tokens.includes(w)));
  return hit ? hit.category : 'smartphones';
}

/** Order-independent identity so "iphone 15 apple 128gb" and "Apple iPhone 15 128GB" are the same product. */
function productKey(brand, name, variant) {
  return [...new Set(tokenize(`${brand || ''} ${name} ${variant || ''}`))].sort().join(' ');
}

function formatCapacity(gb) {
  return gb >= 1024 && gb % 1024 === 0 ? `${gb / 1024}TB` : `${gb}GB`;
}

/** Build name/brand/variant from free text such as "samsung galaxy s24 256gb". */
function describeQuery(query) {
  const clean = query.replace(/\s+/g, ' ').trim();
  const brand = detectBrand(clean);
  // Storage sizes (>= 64GB) pick the variant; RAM sizes are too inconsistent across stores
  const storage = capacitiesOf(tokenize(clean)).filter(gb => gb >= 64);
  const variant = storage.map(formatCapacity).join(' ');
  const name = clean
    .replace(/\b\d+\s*(gb|tb)\b/gi, '')
    .replace(new RegExp(`^${brand || '(?!)'}\\s+`, 'i'), '')
    .replace(/\s+/g, ' ')
    .trim();
  return { brand, name: name || clean, variant };
}

/** Turn a long store title into a short searchable product description. */
function describeTitle(title) {
  const brand = detectBrand(title);
  const brandTokens = brand ? tokenize(brand) : [];
  const nameTokens = tokenize(titleHead(title))
    .filter(t => !TITLE_NOISE.has(t) && !brandTokens.includes(t) && !/^\d+(gb|tb)$/.test(t) && !/^20\d\d$/.test(t))
    .slice(0, 4);
  // Keep the original capitalisation of the words we kept
  const original = title.split(/\s+/);
  const name = nameTokens
    .map(t => original.find(w => normalize(w) === t) || t)
    .join(' ');
  const storage = capacitiesOf(tokenize(title)).filter(gb => gb >= 64);
  return { brand, name, variant: [...new Set(storage)].map(formatCapacity).join(' ') };
}

/** Fetch a product page from a supported store and read its title. */
async function titleFromUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw Object.assign(new Error('That does not look like a valid URL'), { statusCode: 400 });
  }
  const store = STORES.find(s => parsed.hostname.endsWith(s.domain));
  if (!store) {
    const supported = STORES.map(s => s.name).join(', ');
    throw Object.assign(new Error(`Unsupported store. Paste a link from: ${supported}`), { statusCode: 400 });
  }

  const html = store.key === 'flipkart' ? await renderPage(url) : await fetchText(url);
  const $ = cheerio.load(html);
  const title = (
    $('#productTitle').text() ||
    $('meta[property="og:title"]').attr('content') ||
    $('h1').first().text() ||
    $('title').text()
  ).replace(/\s+/g, ' ').trim();

  if (!title) {
    throw Object.assign(new Error('Could not read the product name from that page'), { statusCode: 422 });
  }
  return title.replace(/\s*[|:-]\s*(Buy|Amazon|Flipkart|Reliance|Vijay).*$/i, '');
}

/**
 * Find or create the catalog product described by a search text or store URL.
 * @returns {{ product, created: boolean }}
 */
async function discover({ query, url }, user) {
  let description;
  if (url) {
    description = describeTitle(await titleFromUrl(url.trim()));
  } else {
    description = describeQuery(query);
  }
  const { brand, name, variant } = description;
  if (!name || tokenize(name).length === 0) {
    throw Object.assign(new Error('Please describe the product, e.g. "Samsung Galaxy S24 256GB"'), { statusCode: 400 });
  }

  const key = productKey(brand, name, variant);
  const existing = await Product.findOne({ key });
  if (existing) return { product: existing, created: false };

  const searchQuery = [brand, name, variant].filter(Boolean).join(' ');
  const product = await Product.create({
    name: brand && !normalize(name).startsWith(normalize(brand)) ? `${brand} ${name}` : name,
    brand: brand || undefined,
    category: guessCategory(`${name} ${url ? '' : query}`),
    variant,
    searchQuery,
    key,
    origin: 'USER',
    createdBy: user && user._id,
  });
  return { product, created: true };
}

module.exports = { discover, describeQuery, describeTitle, productKey, guessCategory };
