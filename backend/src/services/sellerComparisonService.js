const Matcher = require('../utils/Matcher');

class SellerComparisonService {
  /**
   * Compares the target product with all potential matches in the database
   * and returns a ranked list of sellers based on final price and availability.
   */
  static async compareSellers(targetProduct, allProducts) {
    const competitors = [];

    // Filter to only true matches
    for (const p of allProducts) {
      // Don't compare with self
      if (p._id.toString() === targetProduct._id.toString()) continue;

      const score = Matcher.calculateMatchScore(targetProduct, p);
      if (Matcher.isMatch(score)) {
        competitors.push(this.buildSellerProfile(p, score));
      }
    }

    // Include the original target product in the ranking as well
    competitors.push(this.buildSellerProfile(targetProduct, 100));

    // Sort competitors
    competitors.sort((a, b) => {
      // Primary: Availability (In stock > Out of stock)
      if (a.availability === 'IN_STOCK' && b.availability !== 'IN_STOCK') return -1;
      if (b.availability === 'IN_STOCK' && a.availability !== 'IN_STOCK') return 1;

      // Secondary: Final Estimated Price (Ascending)
      if (a.estimatedFinalPrice !== b.estimatedFinalPrice) {
        // Handle nulls: Nulls go to the bottom
        if (a.estimatedFinalPrice === null) return 1;
        if (b.estimatedFinalPrice === null) return -1;
        return a.estimatedFinalPrice - b.estimatedFinalPrice;
      }

      return 0;
    });

    // Assign ranks
    competitors.forEach((c, index) => {
      c.rank = index + 1;
      c.isCheapest = index === 0;
    });

    return competitors;
  }

  static buildSellerProfile(product, matchScore) {
    const basePrice = product.currentPrice || 0;
    
    // Parse discount (if it's a numeric string like "500" or percentage. We'll assume raw numeric for simplicity if present)
    let parsedDiscount = 0;
    if (product.discount) {
      const numericDiscount = parseFloat(product.discount.replace(/,/g, '').replace(/[^0-9.]/g, ''));
      if (!isNaN(numericDiscount)) {
        // If discount has % sign, calculate it. Otherwise assume it's flat value.
        if (product.discount.includes('%')) {
          parsedDiscount = basePrice * (numericDiscount / 100);
        } else {
          parsedDiscount = numericDiscount;
        }
      }
    }

    let isDeliveryChargeKnown = product.deliveryCharge !== null && product.deliveryCharge !== undefined;
    const deliveryCharge = product.deliveryCharge || 0;
    
    let estimatedFinalPrice = null;
    if (product.currentPrice !== null && product.currentPrice !== undefined) {
       estimatedFinalPrice = basePrice + deliveryCharge - parsedDiscount;
       // Ensure it doesn't go below 0 due to messy discount scraping
       estimatedFinalPrice = Math.max(0, estimatedFinalPrice); 
    }

    return {
      productId: product._id,
      name: product.name,
      seller: product.seller || 'Unknown Seller',
      source: product.sourceId ? product.sourceId.domain || product.sourceId : 'Unknown Source',
      listedPrice: product.currentPrice,
      deliveryCharge: isDeliveryChargeKnown ? product.deliveryCharge : null,
      discount: parsedDiscount > 0 ? parseFloat(parsedDiscount.toFixed(2)) : 0,
      estimatedFinalPrice: estimatedFinalPrice ? parseFloat(estimatedFinalPrice.toFixed(2)) : null,
      isDeliveryChargeKnown,
      availability: product.availability || 'UNKNOWN',
      estimatedDeliveryDate: product.estimatedDeliveryDate || null,
      matchScore
    };
  }
}

module.exports = SellerComparisonService;
