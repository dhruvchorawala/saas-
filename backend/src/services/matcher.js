/**
 * Decides whether a store listing is the same product as a catalog entry.
 *
 * A listing matches when:
 *  - every model token of the product appears in the listing title,
 *  - the listing does not add a variant word the product doesn't have
 *    ("pro", "plus", "fe", "cellular", ...) — otherwise "iPhone 16" would match "iPhone 16 Pro",
 *  - capacities agree (a 128GB phone never matches a 256GB listing),
 *  - it is not an accessory ("Case for iPhone 16") or a refurbished/used unit.
 */

const KNOWN_BRANDS = [
  'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi', 'Redmi', 'POCO', 'Vivo', 'iQOO', 'OPPO',
  'Realme', 'Motorola', 'Nothing', 'CMF', 'Honor', 'Nokia', 'Sony', 'JBL', 'boAt', 'Bose',
  'Sennheiser', 'Marshall', 'Skullcandy', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer',
  'MSI', 'Microsoft', 'Amazfit', 'Garmin', 'Fire-Boltt', 'Huawei', 'Infinix', 'Tecno',
];

// Words that turn a product into a different model when present in the title's head
const VARIANT_WORDS = new Set([
  'pro', 'max', 'plus', 'ultra', 'mini', 'lite', 'fe', 'neo', 'air', 'slim', 'edge',
  'fold', 'flip', 'se', 'note', 'prime', 'turbo',
]);
// Variant words that may appear anywhere in the title
const VARIANT_WORDS_ANYWHERE = new Set(['cellular', 'lte']);

const ACCESSORY_WORDS = new Set([
  'case', 'cover', 'protector', 'tempered', 'guard', 'skin', 'sleeve', 'pouch', 'charger',
  'cable', 'adapter', 'adaptor', 'holder', 'mount', 'stand', 'strap', 'band', 'lens',
  'replacement', 'battery', 'dock', 'stylus', 'keyboard', 'mouse', 'tips', 'cushion',
]);
const REJECT_ANYWHERE = new Set([
  'refurbished', 'renewed', 'preowned', 'used', 'unboxed', 'compatible', 'dummy', 'emi',
]);

// Words never required to appear in a listing
const STOP_WORDS = new Set([
  'the', 'and', 'with', 'for', 'of', 'in', 'a', 'an', '5g', '4g', 'gb', 'tb', 'inch', 'wifi', 'gps',
]);
// Generic words users type in free-text searches ("sony xm5 headphones") that
// stores may leave out. Curated catalog names are precise, so they keep them.
const FILLER_WORDS = new Set([
  'new', 'latest', 'smartphone', 'phone', 'mobile', 'laptop', 'notebook', 'headphones', 'headphone',
  'earbuds', 'earphones', 'wireless', 'bluetooth', 'tws', 'smartwatch', 'storage', 'ram', 'noise',
  'cancelling', 'canceling', 'anc', 'black', 'white', 'blue', 'green', 'silver', 'grey', 'gray',
  'gold', 'pink', 'price', 'buy', 'online', 'best',
]);
// Brand names that are also everyday words can't be used to spot a different brand
const AMBIGUOUS_BRANDS = new Set(['nothing', 'honor']);
const BRAND_TOKENS = new Set(KNOWN_BRANDS.map(brand => normalize(brand)).filter(b => !AMBIGUOUS_BRANDS.has(b)));

/** Lowercase, unify capacities ("128 GB" -> "128gb") and strip punctuation. */
function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/wi-?fi/g, 'wifi')
    .replace(/pre-?owned/g, 'preowned')
    .replace(/\+/g, ' plus ')
    // Decimal sizes keep their whole part: "13.6 inch" -> "13 inch", "3.4K" -> "3k"
    .replace(/(\d+)\.\d+/g, '$1')
    .replace(/(\d+)\s*(gb|tb|mm)\b/g, '$1$2')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenize(text) {
  const normalized = normalize(text);
  return normalized ? normalized.split(' ') : [];
}

/** Capacity tokens converted to GB, e.g. ["8gb","1tb"] -> [8, 1024]. */
function capacitiesOf(tokens) {
  return tokens
    .map(t => t.match(/^(\d+)(gb|tb)$/))
    .filter(Boolean)
    .map(m => (m[2] === 'tb' ? Number(m[1]) * 1024 : Number(m[1])));
}

/** The part of a title before the descriptive tail: "Apple iPhone 16 (Black, 128 GB)" -> "Apple iPhone 16". */
function titleHead(title) {
  return String(title || '')
    // Short bracketed model names are part of the name: "Nothing Phone (3a) Pro", "Phone (3a Lite)".
    // Brackets holding lists ("(Black, 128 GB)") or capacities stay in the tail.
    .replace(/\((?![^)]*\d\s*(?:gb|tb)\b)([^(),]{1,12})\)/gi, ' $1 ')
    .split(/[([|:,;]|\s[-–]\s|\swith\s/i)[0];
}

/**
 * Tokens a title "contains", tolerant of joined/split model names:
 * "Buds3" also yields "buds" + "3", and "Buds 3" also yields "buds3".
 * (Only splits 3+ letters before digits, so "16e" or "S25" stay intact.)
 */
function tokenForms(tokens) {
  const forms = new Set(tokens);
  tokens.forEach((t, i) => {
    const m = t.match(/^([a-z]{3,})(\d+)$/);
    if (m) {
      forms.add(m[1]);
      forms.add(m[2]);
    }
    if (i + 1 < tokens.length && /^\d+[a-z]*$/.test(tokens[i + 1])) forms.add(t + tokens[i + 1]);
  });
  return forms;
}

function detectBrand(text) {
  const tokens = tokenize(text);
  return KNOWN_BRANDS.find(brand => tokens.includes(normalize(brand))) || null;
}

/** Dice coefficient over token sets, 0..1. */
function similarity(aTokens, bTokens) {
  const a = new Set(aTokens);
  const b = new Set(bTokens);
  if (!a.size || !b.size) return 0;
  let common = 0;
  for (const t of a) if (b.has(t)) common++;
  return (2 * common) / (a.size + b.size);
}

/**
 * Build the matching profile of a catalog product once, then reuse it for every listing.
 * @param {{ name: string, brand?: string, variant?: string, origin?: string }} product
 */
function buildProfile(product) {
  const brandTokens = tokenize(product.brand);
  const nameTokens = tokenize(product.name).filter(t => !brandTokens.includes(t));
  const variantTokens = tokenize(product.variant);
  const allTokens = [...nameTokens, ...variantTokens];
  const lenient = product.origin === 'USER';

  const required = [...new Set(allTokens)].filter(t =>
    !STOP_WORDS.has(t) && !(lenient && FILLER_WORDS.has(t)) && !/^\d+(gb|tb)$/.test(t)
  );
  return {
    brandTokens,
    // A bare number ("OnePlus 15") is only meaningful together with the brand
    requireBrand: brandTokens.length > 0 && required.every(t => /^\d+$/.test(t)),
    wifiOnly: allTokens.includes('wifi'),
    required,
    allTokens: new Set([...brandTokens, ...allTokens]),
    capacities: capacitiesOf(allTokens),
    // First model token, used to tell "Case for iPhone" apart from "iPhone ... Case"
    anchor: required.find(t => !/^\d+$/.test(t)) || required[0],
  };
}

/**
 * True when a numeric token is used as the model number: it appears in the
 * title head, or right next to another word of the model name ("Series 11", "13 inch").
 */
function isModelNumber(number, tokens, headTokens, profile) {
  if (tokenForms(headTokens).has(number)) return true;
  const neighbours = new Set([...profile.required, ...profile.brandTokens, 'inch']);
  return tokens.some((t, i) => t === number && (neighbours.has(tokens[i - 1]) || neighbours.has(tokens[i + 1])));
}

/**
 * Score a listing title against a product profile.
 * @returns {{ ok: boolean, score: number, reason?: string }}
 */
function matchListing(profile, title) {
  const tokens = tokenize(title);
  const tokenSet = tokenForms(tokens);
  const headTokens = tokenize(titleHead(title));

  if (!profile.required.length) return { ok: false, score: 0, reason: 'nothing to match' };

  if (/\b(display|demo)\s+unit\b|\bopen\s+box\b/i.test(title)) {
    return { ok: false, score: 0, reason: 'display/demo unit' };
  }

  for (const t of profile.required) {
    if (!tokenSet.has(t)) return { ok: false, score: 0, reason: `missing "${t}"` };
    // A bare model number must belong to the model name ("Pad 3"), not to specs ("Gen 3", "3.4K")
    if (/^\d+$/.test(t) && !isModelNumber(t, tokens, headTokens, profile)) {
      return { ok: false, score: 0, reason: `"${t}" is not the model number` };
    }
  }
  if (profile.requireBrand && !profile.brandTokens.every(t => tokenSet.has(t))) {
    return { ok: false, score: 0, reason: 'brand missing' };
  }
  const otherBrand = headTokens.find(t => BRAND_TOKENS.has(t) && !profile.allTokens.has(t));
  if (otherBrand) return { ok: false, score: 0, reason: `different brand (${otherBrand})` };

  for (const t of tokens) {
    if (REJECT_ANYWHERE.has(t)) return { ok: false, score: 0, reason: `${t} listing` };
    if (VARIANT_WORDS_ANYWHERE.has(t) && !profile.allTokens.has(t)) {
      return { ok: false, score: 0, reason: `different variant (${t})` };
    }
    // A Wi-Fi-only tablet is a different model from its 5G/cellular version
    if (profile.wifiOnly && (t === '5g' || t === '4g')) {
      return { ok: false, score: 0, reason: 'cellular variant' };
    }
  }
  for (const t of headTokens) {
    if (VARIANT_WORDS.has(t) && !profile.allTokens.has(t)) {
      return { ok: false, score: 0, reason: `different model (${t})` };
    }
  }

  // Accessories name the product after the accessory word: "Case for iPhone 16"
  const anchorIndex = tokens.indexOf(profile.anchor);
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (ACCESSORY_WORDS.has(t) && !profile.allTokens.has(t) && i < anchorIndex) {
      return { ok: false, score: 0, reason: `accessory (${t})` };
    }
    if (t === 'for' && profile.allTokens.has(tokens[i + 1] === 'apple' ? tokens[i + 2] : tokens[i + 1])) {
      return { ok: false, score: 0, reason: 'accessory ("for ...")' };
    }
  }

  if (profile.capacities.length) {
    const listingCaps = capacitiesOf(tokens);
    for (const cap of profile.capacities) {
      if (!listingCaps.includes(cap)) return { ok: false, score: 0, reason: `missing ${cap}GB` };
    }
    // A different storage size means a different variant (small values are RAM)
    const extraStorage = listingCaps.find(cap => cap >= 64 && !profile.capacities.includes(cap));
    if (extraStorage && profile.capacities.some(cap => cap >= 64)) {
      return { ok: false, score: 0, reason: `different storage (${extraStorage}GB)` };
    }
  }

  const score = Math.round(60 + 40 * similarity([...profile.allTokens], headTokens));
  return { ok: true, score };
}

module.exports = {
  KNOWN_BRANDS,
  normalize,
  tokenize,
  titleHead,
  detectBrand,
  buildProfile,
  matchListing,
  capacitiesOf,
};
