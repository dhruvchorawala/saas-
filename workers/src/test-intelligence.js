const { PriceIntelligenceService } = require('./intelligence/priceService');

// Mock a Mongoose Product object
let mockProduct = {
  _id: '64f8a12b9c3f',
  currentPrice: null, // Initially null
};

// Mock mongoose find to return our in-memory array
const historyData = [];
const mockMongoose = {
  find: () => {
    return {
      sort: () => historyData
    };
  },
  create: (doc) => {
    historyData.push(doc);
    return doc;
  }
};

// Override the DB methods for isolated testing
const { PriceHistory } = require('./intelligence/priceService');
PriceHistory.find = mockMongoose.find;
PriceHistory.create = mockMongoose.create;

async function runTest() {
  console.log('--- Scraping Cycle 1 ---');
  let result = await PriceIntelligenceService.processSnapshot(mockProduct, { price: 59999, mrp: 60000 });
  mockProduct = { ...mockProduct, ...result.updateFields };
  console.log(result.updateFields);

  console.log('\n--- Scraping Cycle 2 ---');
  result = await PriceIntelligenceService.processSnapshot(mockProduct, { price: 57999, mrp: 60000 });
  mockProduct = { ...mockProduct, ...result.updateFields };
  console.log(result.updateFields);

  console.log('\n--- Scraping Cycle 3 ---');
  result = await PriceIntelligenceService.processSnapshot(mockProduct, { price: 54999, mrp: 60000 });
  mockProduct = { ...mockProduct, ...result.updateFields };
  console.log(result.updateFields);

  console.log('\n--- Scraping Cycle 4 ---');
  result = await PriceIntelligenceService.processSnapshot(mockProduct, { price: 51999, mrp: 60000 });
  mockProduct = { ...mockProduct, ...result.updateFields };
  console.log(result.updateFields);
}

runTest();
