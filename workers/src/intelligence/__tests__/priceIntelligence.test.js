const mongoose = require('mongoose');

jest.mock('mongoose', () => {
  const mockSort = jest.fn().mockResolvedValue([]);
  return {
    Schema: class {},
    models: {},
    model: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue(true),
      find: jest.fn().mockReturnValue({ sort: mockSort })
    })
  };
});

const { PriceIntelligenceService } = require('../priceService');

// Helper to access the mocked sort function
const getMockSort = () => require('mongoose').model().find().sort;

describe('Price Intelligence Mathematical Aggregates', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly calculate the first price snapshot', async () => {
    getMockSort().mockResolvedValueOnce([{ price: 500 }]);

    const product = { _id: '507f1f77bcf86cd799439011' };
    const scrapedData = { price: 500 };

    const { updateFields } = await PriceIntelligenceService.processSnapshot(product, scrapedData);

    expect(updateFields.currentPrice).toEqual(500);
    expect(updateFields.lowestPrice).toEqual(500);
    expect(updateFields.highestPrice).toEqual(500);
    expect(updateFields.averagePrice).toEqual(500);
  });

  it('should detect new lowest price and calculate percentage drop', async () => {
    getMockSort().mockResolvedValueOnce([
      { price: 1000 },
      { price: 900 },
      { price: 750 } // New low
    ]);

    const product = { _id: '507f1f77bcf86cd799439011', currentPrice: 1000 };
    const scrapedData = { price: 750 };

    const { updateFields } = await PriceIntelligenceService.processSnapshot(product, scrapedData);

    expect(updateFields.currentPrice).toEqual(750);
    expect(updateFields.lowestPrice).toEqual(750); // New low
    expect(updateFields.highestPrice).toEqual(1000); 
    expect(updateFields.priceChange).toEqual(-250); // Dropped 250
    expect(updateFields.priceChangePercentage).toEqual(-25); // 25% drop
  });

  it('should correctly average prices', async () => {
    getMockSort().mockResolvedValueOnce([
      { price: 100 },
      { price: 150 },
      { price: 200 }
    ]);

    const product = { _id: '507f1f77bcf86cd799439011', currentPrice: 150 };
    const scrapedData = { price: 200 };

    const { updateFields } = await PriceIntelligenceService.processSnapshot(product, scrapedData);
    
    // Average of 100, 150, 200 is 150
    expect(updateFields.averagePrice).toEqual(150);
    expect(updateFields.currentPrice).toEqual(200);
  });
});
