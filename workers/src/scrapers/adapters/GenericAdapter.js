const BaseScraper = require('../BaseScraper');

class GenericAdapter extends BaseScraper {
  async extractData(page, $) {
    // Attempt to extract using Open Graph and generic schemas
    let productName = this.safeGetAttr($, 'meta[property="og:title"]', 'content') || this.safeGetText($, 'title');
    const image = this.safeGetAttr($, 'meta[property="og:image"]', 'content');
    
    let price = null;
    let currency = null;
    
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
            }
          }
        }
      } catch (e) {
        // Ignore parsing errors for generic fallback
      }
    });

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
      availability: null,
      deliveryCharge: null,
      estimatedDeliveryDate: null,
      url: this.url,
      source: this.domain,
    };
  }
}

module.exports = GenericAdapter;
