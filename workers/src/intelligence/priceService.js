const mongoose = require('mongoose');

// PriceHistory Schema for Worker
const PriceHistorySchema = new mongoose.Schema({
  product: mongoose.Schema.ObjectId,
  price: Number,
  mrp: Number,
  discount: String,
  seller: String,
  availability: String
}, { timestamps: true });
const PriceHistory = mongoose.models.PriceHistory || mongoose.model('PriceHistory', PriceHistorySchema);

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
      availability: scrapedData.availability
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
