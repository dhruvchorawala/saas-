const ChangeDetector = require('../ChangeDetector');

describe('Event-Driven Change Detection', () => {
  it('should detect a price drop', () => {
    const oldProduct = { price: 1000 };
    const scrapedData = { price: 800 };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes).toContain('PRICE_DECREASE');
    expect(changes).not.toContain('PRICE_INCREASE');
  });

  it('should detect an out-of-stock event', () => {
    const oldProduct = { availability: 'IN_STOCK' };
    const scrapedData = { availability: 'OUT_OF_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes).toContain('OUT_OF_STOCK');
  });

  it('should detect a back-in-stock event', () => {
    const oldProduct = { availability: 'OUT_OF_STOCK' };
    const scrapedData = { availability: 'IN_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes).toContain('BACK_IN_STOCK');
  });

  it('should return no changes if data is identical', () => {
    const oldProduct = { price: 1000, availability: 'IN_STOCK' };
    const scrapedData = { price: 1000, availability: 'IN_STOCK' };

    const changes = ChangeDetector.detectChanges(oldProduct, scrapedData);

    expect(changes.length).toEqual(0);
  });
});
