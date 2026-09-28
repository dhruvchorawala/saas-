const ChangeDetector = require('../ChangeDetector');

describe('Event-Driven Change Detection', () => {
  it('should detect a price drop', () => {
    const oldProduct = { currentPrice: 1000 };
    const scrapedData = { price: 800 };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes.isPriceDrop).toBe(true);
    expect(changes.isPriceIncrease).toBe(false);
  });

  it('should detect an out-of-stock event', () => {
    const oldProduct = { availability: 'IN_STOCK' };
    const scrapedData = { availability: 'OUT_OF_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes.isOutOfStock).toBe(true);
  });

  it('should detect a back-in-stock event', () => {
    const oldProduct = { availability: 'OUT_OF_STOCK' };
    const scrapedData = { availability: 'IN_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes.isBackInStock).toBe(true);
  });

  it('should return no changes if data is identical', () => {
    const oldProduct = { currentPrice: 1000, availability: 'IN_STOCK' };
    const scrapedData = { price: 1000, availability: 'IN_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes.hasChanged).toBe(false);
  });
});
