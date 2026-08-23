class ChangeDetector {
  /**
   * Compare old product state and new scraped data to detect meaningful changes.
   */
  static detectChanges(oldProduct, newScrapedData) {
    const changes = {
      isPriceDrop: false,
      isPriceIncrease: false,
      isBackInStock: false,
      isOutOfStock: false,
      priceDifference: 0,
      priceDifferencePercentage: 0,
      hasChanged: false
    };

    const oldPrice = oldProduct.currentPrice;
    const newPrice = newScrapedData.price;
    const oldAvailability = oldProduct.availability;
    const newAvailability = newScrapedData.availability;

    // Price Analysis
    if (oldPrice !== null && oldPrice !== undefined && newPrice !== null && newPrice !== undefined) {
      if (newPrice < oldPrice) {
        changes.isPriceDrop = true;
        changes.priceDifference = oldPrice - newPrice;
        changes.priceDifferencePercentage = (changes.priceDifference / oldPrice) * 100;
        changes.hasChanged = true;
      } else if (newPrice > oldPrice) {
        changes.isPriceIncrease = true;
        changes.priceDifference = newPrice - oldPrice;
        changes.priceDifferencePercentage = (changes.priceDifference / oldPrice) * 100;
        changes.hasChanged = true;
      }
    } else if ((oldPrice === null || oldPrice === undefined) && newPrice !== null && newPrice !== undefined) {
      // First time setting a price is considered a change, but not necessarily a drop/increase
      changes.hasChanged = true;
    }

    // Availability Analysis
    if (oldAvailability === 'OUT_OF_STOCK' && newAvailability === 'IN_STOCK') {
      changes.isBackInStock = true;
      changes.hasChanged = true;
    } else if (oldAvailability === 'IN_STOCK' && newAvailability === 'OUT_OF_STOCK') {
      changes.isOutOfStock = true;
      changes.hasChanged = true;
    }

    return changes;
  }
}

module.exports = ChangeDetector;
