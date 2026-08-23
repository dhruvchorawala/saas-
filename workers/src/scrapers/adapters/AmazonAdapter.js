const BaseScraper = require('../BaseScraper');

class AmazonAdapter extends BaseScraper {
  async extractData(page, $) {
    const productName = this.safeGetText($, '#productTitle');
    const brand = this.safeGetText($, '#bylineInfo');
    const image = this.safeGetAttr($, '#landingImage', 'src') || this.safeGetAttr($, '#imgBlkFront', 'src');
    
    // Price logic is complex on Amazon
    const priceWhole = this.safeGetText($, '.a-price-whole');
    const priceFraction = this.safeGetText($, '.a-price-fraction');
    const priceStr = priceWhole && priceFraction ? `${priceWhole}${priceFraction}` : this.safeGetText($, '.a-offscreen');
    const price = this.parsePrice(priceStr);

    const mrpStr = this.safeGetText($, '.a-text-price .a-offscreen');
    const mrp = this.parsePrice(mrpStr);

    const discount = this.safeGetText($, '.savingsPercentage');
    const currency = this.safeGetText($, '.a-price-symbol') || '$';
    const availability = this.safeGetText($, '#availability span');
    
    // Usually 'Ships from and sold by Amazon.com'
    const seller = this.safeGetText($, '#merchant-info');

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
      availability: availability ? availability.trim() : 'Unknown',
      deliveryCharge: null,
      estimatedDeliveryDate: this.safeGetText($, '#mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-text-bold'),
      url: this.url,
      source: this.domain,
    };
  }
}

module.exports = AmazonAdapter;
