const BaseScraper = require('../BaseScraper');

class AmazonAdapter extends BaseScraper {
  async extractData(page, $) {
    // Detect Amazon Captcha
    if ($('form[action="/errors/validateCaptcha"]').length > 0 || $('title').text().includes('Robot Check') || $('title').text().includes('Bot Check')) {
      throw new Error('Bot detection triggered (Captcha). Please try again or use a proxy.');
    }

    const productName = this.safeGetText($, '#productTitle') || this.safeGetAttr($, 'meta[property="og:title"]', 'content') || this.safeGetText($, 'title');
    let brand = this.safeGetText($, '#bylineInfo') || this.safeGetText($, '.po-brand .a-span9');
    const image = this.safeGetAttr($, '#landingImage', 'src') || this.safeGetAttr($, '#imgBlkFront', 'src') || this.safeGetAttr($, 'meta[property="og:image"]', 'content');
    
    // Price logic is complex on Amazon
    const priceWhole = this.safeGetText($, '.a-price-whole');
    const priceFraction = this.safeGetText($, '.a-price-fraction');
    const priceStr = priceWhole && priceFraction ? `${priceWhole}${priceFraction}` : this.safeGetText($, '.a-offscreen') || this.safeGetText($, '#priceblock_ourprice');
    const price = this.parsePrice(priceStr);

    const mrpStr = this.safeGetText($, '.a-text-price .a-offscreen');
    const mrp = this.parsePrice(mrpStr);

    const discount = this.safeGetText($, '.savingsPercentage');
    const currency = this.safeGetText($, '.a-price-symbol') || '$';
    let availabilityText = this.safeGetText($, '#availability span');
    let parsedAvailability = 'Unknown';
    if (availabilityText) {
      availabilityText = availabilityText.toLowerCase();
      if (availabilityText.includes('in stock') || availabilityText.includes('available') || availabilityText.includes('left in stock')) {
        parsedAvailability = 'In Stock';
      } else if (availabilityText.includes('out of stock') || availabilityText.includes('unavailable')) {
        parsedAvailability = 'Out of Stock';
      }
    }
    
    // Usually 'Ships from and sold by Amazon.com'
    const seller = this.safeGetText($, '#merchant-info');

    // Shipping and Delivery
    const deliveryText = this.safeGetText($, '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-text-bold') || '';
    const freeDeliveryMatch = deliveryText.toLowerCase().includes('free delivery') || deliveryText.toLowerCase().includes('free shipping');
    let shippingCost = 0;
    if (!freeDeliveryMatch) {
      // Very naive attempt to extract a shipping fee if it exists nearby
      const shippingText = this.safeGetText($, '#deliveryBlockMessage');
      if (shippingText) {
        shippingCost = this.parsePrice(shippingText) || 0;
      }
    }
    
    // Effective Price
    const effectivePrice = (price || 0) + shippingCost;
    
    // ASIN Extraction
    let asin = this.safeGetAttr($, '#ASIN', 'value');
    if (!asin && this.url) {
      const match = this.url.match(/\/(?:dp|gp\/product)\/([A-Z0-9]{10})/i);
      if (match && match[1]) {
        asin = match[1];
      }
    }

    return {
      productName,
      brand: brand ? brand.replace('Brand: ', '').replace('Visit the ', '').replace(' Store', '') : null,
      image,
      price,
      mrp,
      discount,
      currency,
      seller,
      variant: null, // Hard to reliably extract generically on Amazon without clicking
      availability: parsedAvailability,
      deliveryCharge: shippingCost,
      shippingCost,
      effectivePrice,
      estimatedDeliveryDate: deliveryText,
      asin,
      internalProductId: asin || null,
      sourceProductId: asin || null,
      url: this.url,
      source: this.domain,
    };
  }
}

module.exports = AmazonAdapter;
