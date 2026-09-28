const mongoose = require('mongoose');

const PriceHistory = require('../../backend/src/models/PriceHistory');
const AvailabilitySnapshot = require('../../backend/src/models/AvailabilitySnapshot');

class PriceIntelligenceService {
  static async processSnapshot(product, scrapedData) {
    const currentPrice = scrapedData.price;
    if (currentPrice === null || currentPrice === undefined) {
      // If we couldn't extract a price, we don't save a historical snapshot for calculations
      return { updateFields: {} };
    }

    // Create history snapshot
    await PriceHistory.create({
      product: product._id,
      price: currentPrice,
      mrp: scrapedData.mrp,
      discount: scrapedData.discount,
      seller: scrapedData.seller,
      availability: scrapedData.availability,
      currency: scrapedData.currency,
      shippingCost: scrapedData.shippingCost,
      effectivePrice: scrapedData.effectivePrice
    });

    // Create Availability snapshot
    let availabilityStatus = 'UNKNOWN';
    if (scrapedData.availability === 'In Stock') availabilityStatus = 'IN_STOCK';
    else if (scrapedData.availability === 'Out of Stock') availabilityStatus = 'OUT_OF_STOCK';

    await AvailabilitySnapshot.create({
      product: product._id,
      seller: scrapedData.seller,
      status: availabilityStatus,
      deliveryEstimate: scrapedData.estimatedDeliveryDate,
      shippingCost: scrapedData.shippingCost
    });

    // Calculate Intelligence
    const history = await PriceHistory.find({ product: product._id }).sort('createdAt');
    const prices = history.map(h => h.price).filter(p => p !== null && p !== undefined);

    let lowestPrice = currentPrice;
    let highestPrice = currentPrice;
    let sum = 0;

    prices.forEach(p => {
      if (p < lowestPrice) lowestPrice = p;
      if (p > highestPrice) highestPrice = p;
      sum += p;
    });

    const averagePrice = prices.length > 0 ? sum / prices.length : currentPrice;
    
    // Determine previous price
    let previousPrice = product.currentPrice;
    if (previousPrice === undefined || previousPrice === null) {
      previousPrice = currentPrice;
    }

    const priceChange = currentPrice - previousPrice;
    let priceChangePercentage = 0;
    if (previousPrice > 0) {
      priceChangePercentage = (priceChange / previousPrice) * 100;
    }

    return {
      updateFields: {
        currentPrice,
        previousPrice,
        lowestPrice,
        highestPrice,
        averagePrice: parseFloat(averagePrice.toFixed(2)),
        priceChange: parseFloat(priceChange.toFixed(2)),
        priceChangePercentage: parseFloat(priceChangePercentage.toFixed(2))
      }
    };
  }
}

module.exports = { PriceIntelligenceService, PriceHistory };
