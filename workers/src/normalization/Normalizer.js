const stringSimilarity = require('string-similarity');

class Normalizer {
  // Define common dictionaries
  static BRAND_MAP = {
    'apple inc.': 'Apple',
    'apple': 'Apple',
    'samsung': 'Samsung',
    'sony': 'Sony',
    'microsoft': 'Microsoft'
  };

  static AVAILABILITY_MAP = {
    'in stock': 'IN_STOCK',
    'available': 'IN_STOCK',
    'out of stock': 'OUT_OF_STOCK',
    'currently unavailable': 'OUT_OF_STOCK',
    'pre-order': 'PREORDER',
    'preorder': 'PREORDER'
  };

  /**
   * Main entry for normalizing a raw scraped product object
   */
  static normalize(rawProduct) {
    if (!rawProduct) return null;

    const normalizedName = this.normalizeText(rawProduct.productName);
    
    // Extract implicit attributes from the title if not explicitly provided
    const extractedBrand = this.extractBrand(normalizedName) || this.normalizeBrand(rawProduct.brand);
    const storage = this.extractStorage(normalizedName);
    const color = this.extractColor(normalizedName);
    
    // Parse variants if they are already strings
    const existingVariant = rawProduct.variant ? this.normalizeText(rawProduct.variant) : null;
    let finalVariant = existingVariant;
    
    if (storage) finalVariant = finalVariant ? `${finalVariant} ${storage}` : storage;
    if (color) finalVariant = finalVariant ? `${finalVariant} ${color}` : color;

    return {
      name: normalizedName,
      brand: extractedBrand,
      variant: finalVariant ? finalVariant.trim() : null,
      price: this.normalizePrice(rawProduct.price),
      mrp: this.normalizePrice(rawProduct.mrp),
      discount: rawProduct.discount ? rawProduct.discount.trim() : null,
      currency: this.normalizeCurrency(rawProduct.currency),
      availability: this.normalizeAvailability(rawProduct.availability),
      seller: rawProduct.seller ? rawProduct.seller.trim() : 'Unknown',
      deliveryCharge: this.normalizePrice(rawProduct.deliveryCharge),
      image: rawProduct.image,
      url: rawProduct.url,
      source: rawProduct.source,
      scrapedAt: rawProduct.scrapedAt
    };
  }

  static normalizeText(text) {
    if (!text) return '';
    // Lowercase, trim, collapse multiple spaces into one, remove some common noise punctuation
    return text.toLowerCase()
      .replace(/[,;]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static normalizeBrand(brandStr) {
    if (!brandStr) return 'Unknown';
    const clean = brandStr.toLowerCase().trim();
    return this.BRAND_MAP[clean] || brandStr.trim();
  }

  static extractBrand(text) {
    if (text.includes('iphone') || text.includes('macbook') || text.includes('ipad')) return 'Apple';
    if (text.includes('galaxy')) return 'Samsung';

    for (const [key, canonical] of Object.entries(this.BRAND_MAP)) {
      if (text.includes(key)) return canonical;
    }
    return null;
  }

  static extractStorage(text) {
    // Looks for 64gb, 128 gb, 1 tb, 512gb etc.
    const regex = /\b(\d+)\s*(gb|tb)\b/i;
    const match = text.match(regex);
    if (match) {
      return `${match[1]}${match[2].toUpperCase()}`; // e.g. "128GB"
    }
    return null;
  }

  static extractColor(text) {
    const commonColors = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'silver', 'gold', 'space gray', 'midnight'];
    for (const color of commonColors) {
      if (text.includes(color)) return color.charAt(0).toUpperCase() + color.slice(1);
    }
    return null;
  }

  static normalizePrice(val) {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    // Replace comma with dot if it's used as a decimal separator (e.g. 799,00 -> 799.00)
    let str = String(val).replace(/,(\d{2})$/, '.$1').replace(/,/g, '');
    const match = str.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  }

  static normalizeCurrency(val) {
    if (!val) return 'USD'; // Default fallback
    const map = {
      '$': 'USD',
      'usd': 'USD',
      '£': 'GBP',
      'gbp': 'GBP',
      '€': 'EUR',
      'eur': 'EUR'
    };
    const clean = val.toLowerCase().trim();
    return map[clean] || clean.toUpperCase();
  }

  static normalizeAvailability(val) {
    if (!val) return 'UNKNOWN';
    const clean = val.toLowerCase().trim();
    return this.AVAILABILITY_MAP[clean] || 'UNKNOWN';
  }
}

module.exports = Normalizer;
