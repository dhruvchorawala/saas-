const BaseScraper = require('../BaseScraper');

class GenericAdapter extends BaseScraper {
  async extractData(page, $) {
    // Attempt to extract using Open Graph and generic schemas
    let productName = this.safeGetAttr($, 'meta[property="og:title"]', 'content') || this.safeGetText($, 'title');
    const image = this.safeGetAttr($, 'meta[property="og:image"]', 'content');
    
    let price = null;
    let currency = null;
    let availability = 'Unknown';
    
    // Look for JSON-LD Product schema
    const jsonLdScripts = $('script[type="application/ld+json"]');
    jsonLdScripts.each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        // Handle array of schemas or single schema
        const schemas = Array.isArray(json) ? json : [json];
        for (const schema of schemas) {
          if (schema['@type'] === 'Product') {
            if (schema.name) productName = schema.name;
            if (schema.offers) {
              const offer = Array.isArray(schema.offers) ? schema.offers[0] : schema.offers;
              if (offer.price) price = parseFloat(offer.price);
              if (offer.priceCurrency) currency = offer.priceCurrency;
              if (offer.availability) {
                if (offer.availability.includes('InStock')) availability = 'In Stock';
                else if (offer.availability.includes('OutOfStock')) availability = 'Out of Stock';
              }
            }
          }
        }
      } catch (e) {
        // Ignore parsing errors for generic fallback
      }
    });

    // Fallback: check common CSS classes if not found in schema
    if (availability === 'Unknown') {
      const pageText = $('body').text().toLowerCase();
      // Only do a basic check if specific elements exist
      if ($('.out-of-stock, .sold-out, [disabled]').length > 0) {
         availability = 'Out of Stock';
      } else if ($('.in-stock, .add-to-cart, button:contains("Add to cart")').length > 0) {
         availability = 'In Stock';
      }
    }

    return {
      productName,
      brand: this.safeGetAttr($, 'meta[property="og:site_name"]', 'content'),
      image,
      price,
      mrp: null,
      discount: null,
      currency,
      seller: null,
      variant: null,
      availability,
      deliveryCharge: null,
      estimatedDeliveryDate: null,
      url: this.url,
      source: this.domain,
    };
  }
}

module.exports = GenericAdapter;
